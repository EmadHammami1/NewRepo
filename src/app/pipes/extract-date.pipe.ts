import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractDate'
})
export class ExtractDatePipe implements PipeTransform {

  transform(value: Date): string {
    // if(value) return (value.getMonth() < 10 ? '0' : '') + value.getDay() + '-'
    // + (value.getMonth() < 10 ? '0' : '') +value.getMonth() + '-'+ value.getFullYear()

    // return value.toJSON()
    return value ? value.toJSON().slice(0, 10) : ''
  }

}
