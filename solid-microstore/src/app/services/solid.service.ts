import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FOAF, RDF } from "@inrupt/vocab-common-rdf";
import * as N3 from 'n3';
import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';


const { namedNode, defaultGraph } = N3.DataFactory;
const WMP = {
  hasProvider: namedNode('https://webmonetization.org/ns#hasProvider'),
  apiUrl: namedNode('https://webmonetization.org/ns#apiUrl')
}

@Injectable({
  providedIn: 'root'
})
export class SolidService {
  private store = new N3.Store();
  rawTurtle: string | null = null;

  constructor(private auth: AuthService, private http: HttpClient) { }

  getWebMonetizationProvider(): Observable<string> {
    return this.loadProfile().pipe(
      switchMap(_ => this.getMaker()),
      map(me => me ? this.store.getObjects(me, WMP.hasProvider, defaultGraph()) : []),
      switchMap(providers => providers?.length > 0 ? of(providers[0]) : throwError(() => new Error('no WMP relation present!'))),
      map(q => this.store.getObjects(q, WMP.apiUrl, defaultGraph())),
      switchMap(res => res?.length > 0 ? of(res[0].value) : throwError(() => new Error("no apiUrl for WMP present!")))
    )
  }

  /**
   * Returns the #me NamedNode from the stored WebID Profile
   * @returns Observable of a N3.NamedNode
   */
  private getMaker(): Observable<N3.NamedNode | null> {
    // Find subjects of type Person
    let me = this.store.getSubjects(RDF.type, FOAF.Person, defaultGraph());
    if (me.length > 0) {
      return of(me[0] as N3.NamedNode);
    } else {
      return of(null);
    }
  }

  /**
   * Load the WebID profile by asynchronously parsing the RDF structures and adding them as Quads to an internal memory store.
   * @returns 
   */
  private loadProfile(): Observable<void> {
    this.store = new N3.Store();
    return new Observable(sub => {
      const arr = [];
      // Define callback
      const cb = (error: any, quad: any, prefixes: any) => {
        if (quad) {
          this.store.addQuad(quad);
          arr.push(quad);
        } else {
          sub.next();
          sub.complete();
        }
      };
      if (this.auth.getWebId()) {
        // Get public WebID profile
        this.http.get(this.auth.getWebId(), { responseType: 'text' }).subscribe(txt => {
          // Define parser and call async parsing
          new N3.Parser({ baseIRI: this.auth.getWebId()!!, format: 'text/turtle', }).parse(txt, cb)
        });
      }
    });
  }
}
