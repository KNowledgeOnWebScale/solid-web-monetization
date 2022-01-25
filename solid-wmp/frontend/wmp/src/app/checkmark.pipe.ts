import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkmark'
})
export class CheckmarkPipe implements PipeTransform {

  transform(check: boolean): string {
    const style = check ? 'text-success' : 'text-danger' ;
    const icon = check ? '&#10003;' : '&#10007;';
    return  `<div class="${style}">${icon}</div>`;
  }

}
