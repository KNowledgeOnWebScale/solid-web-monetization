import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FOAF, RDF } from "@inrupt/vocab-common-rdf";
import * as N3 from 'n3';
import { map, mergeMap, Observable, of, switchMap, tap, toArray } from 'rxjs';
import { AuthService } from './auth-service.service';


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
  private store = new N3.Store();
  private prefixes: Record<string, N3.NamedNode<string>> = {};
  rawTurtle: string | null = null;

  constructor(private auth: AuthService, private http: HttpClient) { }

  listPaymentPointers(): Observable<string[]> {
    return this.getPaymentPointers().pipe(
      mergeMap(res => res),
      map(quadObject => this.store.getObjects(quadObject, PP.paymentPointerValue, defaultGraph())),
      mergeMap(res => res.map(r => r.value)),
      toArray<string>()
    );
  }

  private getPaymentPointers(): Observable<N3.NamedNode[]> {
    return this.loadProfile().pipe(
      switchMap(_ => this.getMaker()),
      map(me => me ? this.store.getObjects(me, PP.hasPaymentPointer, defaultGraph()) : []),
      map(q => q as N3.NamedNode[])
    );
  }

  private getMaker(): Observable<N3.NamedNode|null> {
    let me = this.store.getSubjects(RDF.type, FOAF.Person, defaultGraph());
    if (me.length > 0) {
      return of(me[0] as N3.NamedNode);
    } else {
      return of(null);
    }
  }

  private loadProfile(): Observable<void> {
    this.store = new N3.Store();
    return new Observable(sub => {
      const arr = [];
      const cb = (error:any, quad: any, prefixes: any) => {
        if (quad) {
          this.store.addQuad(quad);
          arr.push(quad);
        } else {
          this.prefixes = prefixes;
          sub.next();
          sub.complete();
        }
      };
      this.http.get(this.auth.getWebId()!!, {responseType: 'text'}).subscribe(txt => {
        new N3.Parser({ baseIRI: this.auth.getWebId()!!, format: 'text/turtle', }).parse(txt, cb)
      });
    });
  }
}
