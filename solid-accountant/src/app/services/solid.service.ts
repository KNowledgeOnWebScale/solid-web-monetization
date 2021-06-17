import { Injectable } from '@angular/core';
import * as solidAuth from '@inrupt/solid-client-authn-browser';
import { FOAF, RDF, RDFS } from "@inrupt/vocab-common-rdf";
import * as N3 from 'n3';
import { defer, EMPTY, from, Observable, of } from 'rxjs';
import { map, mergeMap, reduce, switchMap, switchMapTo, tap, toArray } from 'rxjs/operators';
const { namedNode, blankNode, literal, quad, defaultGraph, triple, variable } = N3.DataFactory;

const PP = {
  hasPaymentPointer: namedNode("https://paymentpointers.org/ns#hasPaymentPointer"),
  paymentPointerValue: namedNode("https://paymentpointers.org/ns#paymentPointerValue"),
  InterledgerPaymentPointer: namedNode('https://paymentpointers.org/ns#InterledgerPaymentPointer'),
  PREFIX: 'https://paymentpointers.org/ns#'
}

@Injectable({
  providedIn: 'root'
})
export class SolidService {
  readonly parser = new N3.Parser({ format: 'text/turtle' });
  private writer = new N3.Writer({ format: 'application/sparql-update' });
  private store = new N3.Store();
  private prefixes: Record<string, N3.NamedNode<string>> = {};
  rawTurtle: string | null = null;

  constructor() { }

  getSession() {
    return solidAuth.getDefaultSession();
  }

  getProfileAsQuads(): Observable<[N3.Quad[], N3.Prefixes]> {
    return new Observable(sub => {
      const arr = [];
      const cb = (error, quad, prefixes) => {
        if (quad) {
          arr.push(quad);
        } else {
          sub.next([arr, prefixes]);
          sub.complete();
        }
      };

      this.fetch(this.webId).then(res => res.text().then(txt => {
        new N3.Parser({ baseIRI: this.webId, format: 'text/turtle' }).parse(txt, cb)
      }));
    });
  }

  loadProfile(): Observable<void> {
    this.store = new N3.Store();
    return new Observable(sub => {
      const arr = [];
      const cb = (error, quad, prefixes) => {
        if (quad) {
          this.store.addQuad(quad);
          arr.push(quad);
        } else {
          this.prefixes = prefixes;
          sub.next();
          sub.complete();
        }
      };
      this.fetch(this.profileCard).then(res => res.text().then(txt => {
        this.rawTurtle = txt;
        new N3.Parser({ baseIRI: this.webId, format: 'text/turtle', }).parse(txt, cb)
      }));
    });
  }

  getMaker(): Observable<N3.NamedNode> {
    let me = this.store.getSubjects(RDF.type, FOAF.Person, defaultGraph());
    if (me.length > 0) {
      return of(me[0] as N3.NamedNode);
    } else {
      return of(null);
    }
  }


  loadAsTurtle(): Observable<string> {
    return this.getMaker().pipe(
      switchMap(me => new Observable<string>(sub => {
        this.writer = new N3.Writer({ format: 'text/turtle', prefixes: this.prefixes });
        const quads = this.store.getQuads(null, null, null, null);
        this.writer.addQuads(quads);
        this.writer.end((err, res) => {
          if (err) {
            sub.error(err);
          } else {
            sub.next(res);
            sub.complete();
          }
        });
      })
      ));
  }

  listPaymentPointers(): Observable<string[]> {
    return this.getPaymentPointers().pipe(
      mergeMap(res => res),
      map(quadObject => this.store.getObjects(quadObject, PP.paymentPointerValue, defaultGraph())),
      mergeMap(res => res.map(r => r.value)),
      toArray<string>()
    );
  }

  getPaymentPointers(): Observable<N3.NamedNode[]> {
    return this.getMaker().pipe(
      map(me => me ? this.store.getObjects(me, PP.hasPaymentPointer, defaultGraph()) : []),
      map(q => q as N3.NamedNode[])
    );
  }

  private generateUniquePaymentPointerNode(): N3.NamedNode {
    const prefix = '#me-paymentpointer-';
    const PATTERN = /#me-paymentpointer-(\d+)/;
    let idx = 0;
    this.store.forSubjects(sub => {
      const res = sub.value.match(PATTERN);
      if (res?.length > 1) {
        idx = parseInt(res[1]);
      }

    }, null, null, null);
    return namedNode(`${prefix}${idx + 1}`);
  }

  getProfileAsText(): string {
    return this.rawTurtle;
  }

  restore(): Observable<Response> {
    return this.saveTextTurtle(this.restoreTxt);
  }

  restoreLocal(): Observable<Response> {
    return this.saveTextTurtle(this.restoreLocalTxt);
  }

  private restoreLocalTxt = dontIndent`
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.
  @prefix solid: <http://www.w3.org/ns/solid/terms#>.

  <>
      a foaf:PersonalProfileDocument;
      foaf:maker <http://localhost:3000/tdupont/profile/card>;
      foaf:primaryTopic <http://localhost:3000/tdupont/profile/card>.

  <http://localhost:3000/tdupont/profile/card>
    
      solid:oidcIssuer <http://localhost:3000/>;
      a foaf:Person.
  `;

  private restoreTxt = dontIndent`
  @prefix : <#>.
  @prefix solid: <http://www.w3.org/ns/solid/terms#>.
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.
  @prefix pim: <http://www.w3.org/ns/pim/space#>.
  @prefix schema: <http://schema.org/>.
  @prefix ldp: <http://www.w3.org/ns/ldp#>.
  @prefix pro: <./>.
  @prefix n0: <http://www.w3.org/ns/auth/acl#>.
  @prefix inbox: </inbox/>.
  @prefix tdu: </>.
  
  pro:card a foaf:PersonalProfileDocument; foaf:maker :me; foaf:primaryTopic :me.
  
  :me
      a schema:Person, foaf:Person;
      n0:trustedApp
              [
                  n0:mode n0:Append, n0:Control, n0:Read, n0:Write;
                  n0:origin <http://localhost:4200>
              ];
      ldp:inbox inbox:;
      pim:preferencesFile </settings/prefs.ttl>;
      pim:storage tdu:;
      solid:account tdu:;
      solid:privateTypeIndex </settings/privateTypeIndex.ttl>;
      solid:publicTypeIndex </settings/publicTypeIndex.ttl>;
      foaf:name "Thomas".  
  `;

  private saveTextTurtle(turtleTxt: string): Observable<Response> {
    return defer(() => this.fetch(this.webId, {
      method: 'put',
      headers: {
        'Content-Type': 'text/turtle',
      },
      body: turtleTxt
    }));
  }



  addPointer(pointer: string): Observable<Response> {
    return this.getMaker().pipe(
      map(me => this.makePatch(me, [pointer], null)),
      switchMap(body => from(this.fetch(this.webId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/sparql-update' },
        body
      })))
    );
  }

  delPointer(pointer: string): Observable<Response> {
    const values = this.store.getSubjects(PP.paymentPointerValue, literal(pointer), defaultGraph())
      .map(sub => ({ pointerRef: sub as N3.NamedNode<string>, pointerValue: pointer }));
    return this.getMaker().pipe(
      map(me => this.makePatch(me, null, values)),
      switchMap(body => from(this.fetch(this.webId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/sparql-update' },
        body
      })))
    );
  }

  private get fetch() {
    return this.getSession().fetch;
  }

  get webId() {
    return this.getSession().info.webId;
  }

  private get profileCard(): string {
    return this.webId;
    // const idx = this.webId.indexOf('#');
    // return idx > -1 ? this.webId.substring(0, idx) : this.webId;
  }

  private makePatch(me: N3.NamedNode, addPointers: string[] | null, delPointers: { pointerRef: N3.NamedNode, pointerValue: string }[] | null): string {
    const t = (term: N3.Term) => {
      if (term.termType === 'NamedNode' && (term.value.startsWith('http') || term.value.startsWith('#'))) {
        return `<${term.value}>`;
      } else if (term.termType === 'NamedNode') {
        return term.value;
      } else if (term.termType === 'Literal') {
        return `"${term.value}"`;
      } else {
        return term.value;
      }
    }

    //TODO: This works!!
    // let patch = `PREFIX pp: <${PP.PREFIX}>\n`;
    let patch = '';
    if (addPointers?.length > 0) {
      addPointers.forEach(pointer => {
        const pointerRef = this.generateUniquePaymentPointerNode();
        patch += `INSERT DATA {`
        patch += `  ${t(me)} ${t(PP.hasPaymentPointer)} ${t(pointerRef)}.`;
        patch += `  ${t(pointerRef)} ${t(RDF.type)} ${t(PP.InterledgerPaymentPointer)};`
        patch += `  ${t(PP.paymentPointerValue)} "${pointer}".`
        patch += `}`
      });
    }
    if (delPointers?.length > 0) {
      delPointers.forEach(pointer => {
        const pointerRef = pointer.pointerRef;
        patch += `DELETE DATA {`
        patch += `  ${t(me)} ${t(PP.hasPaymentPointer)} ${t(pointerRef)}.`;
        patch += `  ${t(pointerRef)} ${t(RDF.type)} ${t(PP.InterledgerPaymentPointer)};`
        patch += `  ${t(PP.paymentPointerValue)} "${pointer.pointerValue}".`
        patch += `}`
      });
    }
    return patch;
  }
}


function dontIndent(str: any) {
  const countSpaces = (txt: string) => {
    return txt.length - txt.trimStart().length
  }

  let lines: string[] = str[0].split('\n');
  let indent = 100;
  lines.forEach(line => {
    if (line.length > 0) {
      indent = Math.min(indent, countSpaces(line))
    }
  });

  let contentStarted = false;
  lines = lines.filter(line => {
    if (!contentStarted && line.trim().length == 0) {
      return false;
    }
    else if (!contentStarted) {
      contentStarted = true;
      return true
    } else {
      return true;
    }
  });

  return lines.map(line => line.substring(indent)).join('\n');
}