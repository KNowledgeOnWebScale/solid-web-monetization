import { Injectable } from '@angular/core';
import * as solidAuth from '@inrupt/solid-client-authn-browser';
import { FOAF, RDF } from "@inrupt/vocab-common-rdf";
import * as N3 from 'n3';
import { from, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, toArray } from 'rxjs/operators';
const { namedNode, literal, defaultGraph } = N3.DataFactory;

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

  /**
   * Return the default session from the authentication library
   * @returns
   */
  getSession() {
    return solidAuth.getDefaultSession();
  }

  /**
   * Load the WebID profile by asynchronously parsing the RDF structures and adding them as Quads to an internal memory store.
   * @returns 
   */
  loadProfile(): Observable<void> {
    this.store = new N3.Store();
    return new Observable(sub => {
      const arr = [];
      // Define callback
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
      // Execute fetch
      this.fetch(this.profileCard).then(res => res.text().then(txt => {
        this.rawTurtle = txt;
        // Define parser and call async parsing
        new N3.Parser({ baseIRI: this.webId, format: 'text/turtle', }).parse(txt, cb)
      }));
    });
  }

  /**
   * Returns the #me NamedNode from the stored WebID Profile
   * @returns Observable of a N3.NamedNode
   */
  getMaker(): Observable<N3.NamedNode> {
    // Find subjects of type Person
    let me = this.store.getSubjects(RDF.type, FOAF.Person, defaultGraph());
    if (me.length > 0) {
      return of(me[0] as N3.NamedNode);
    } else {
      return of(null);
    }
  }


  /**
   * Writes the store quads from the WebID Profile formatted as txt/turtle.
   * @returns Observable of string
   */
  loadAsTurtle(): Observable<string> {
    return this.getMaker().pipe(
      switchMap(me => new Observable<string>(sub => {
        // Define writer
        this.writer = new N3.Writer({ format: 'text/turtle', prefixes: this.prefixes });
        // Get all quads from store
        const quads = this.store.getQuads(null, null, null, null);
        this.writer.addQuads(quads);
        // Write and output on the Observable as string
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

  /**
   * Returns a list of stored paymentpointers from the loaded WebID profile.
   * @returns Observable of a string array
   */
  listPaymentPointers(): Observable<string[]> {
    return this.getPaymentPointers().pipe(
      mergeMap(res => res),
      map(quadObject => this.store.getObjects(quadObject, PP.paymentPointerValue, defaultGraph())),
      mergeMap(res => res.map(r => r.value)),
      toArray<string>()
    );
  }

  /**
   * Returns the paymentpointer nodes from the loaded WebID profile.
   * @returns Observable of N3.NamedNode array
   */
  getPaymentPointers(): Observable<N3.NamedNode[]> {
    return this.getMaker().pipe(
      map(me => me ? this.store.getObjects(me, PP.hasPaymentPointer, defaultGraph()) : []),
      map(q => q as N3.NamedNode[])
    );
  }

  /**
   * Generates a unique name for the internal named node that represents a payment pointer.
   * _(Alternative to blank nodes)_
   * @returns N3.NamedNode
   */
  private generateUniquePaymentPointerNode(): N3.NamedNode {
    const prefix = '#me-paymentpointer-';
    const PATTERN = /#me-paymentpointer-(\d+)/;
    let idx = 0;
    // For each subject in the store:
    this.store.forSubjects(sub => {
      // If it matches the pattern
      const res = sub.value.match(PATTERN);
      if (res?.length > 1) {
        // Get the current index
        idx = parseInt(res[1]);
      }

    }, null, null, null);
    // Increment the index by 1 and add it as suffix
    return namedNode(`${prefix}${idx + 1}`);
  }

  /**
   * Return the profile as raw txt/turtle string
   * @returns String
   */
  getProfileAsText(): string {
    return this.rawTurtle;
  }

  /**
   * Add a new paymentpointer to the WebID Profile using spartql PATCHes
   * @param pointer Paymentpointer value to add
   * @returns Observable of Response
   */
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

  /**
   * Remove a paymentpointer from the WebID Profile using spartql PATCHes
   * @param pointer Paymentpointer value to remove
   * @returns Observable of Response
   */
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

  /**
   * Returns the fetch method with the correct auth headers added from the auth library.
   */
  private get fetch() {
    return this.getSession().fetch;
  }

  /**
   * Returns the user's WebID from the auth library.
   */
  get webId() {
    return this.getSession().info.webId;
  }

  /**
   * Returns the user's profile card.
   */
  private get profileCard(): string {
    return this.webId;
  }

  /**
   * Construc the complete SPARQL PATCH update body
   * @param me NamedNode referencing the user
   * @param addPointers PaymentPointers to add
   * @param delPointers PaymentPointers to remove
   * @returns 
   */
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