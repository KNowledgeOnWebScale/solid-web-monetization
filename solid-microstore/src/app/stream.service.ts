import { Injectable } from '@angular/core';
import { createConnection } from 'ilp-protocol-stream'
// ILP-OVER-HTTP ook een optie
import Plugin from 'ilp-plugin-btp';


@Injectable({
  providedIn: 'root'
})
export class StreamService {

  constructor() { }

  connect(ilpAddress: string, sharedKey: Buffer) {
    return (async () => {
      const connection = await createConnection({
        plugin: new Plugin({ server: 'btp+ws://localhost:8888/ws' }),
        destinationAccount: ilpAddress,
        sharedSecret: sharedKey
      })

      return {
        connection,
        createStream: () => connection.createStream(),
        end: () => connection.end(),
        destory: () => connection.destroy()
      }
    })()
  }
}
