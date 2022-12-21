import { Pipe, PipeTransform } from '@angular/core';
import { Module } from '../services/modules.service';

@Pipe({ name: 'getModuleCategory' })
export class GetModuleCategoryPipe implements PipeTransform {
  transform(value: Module[], category: string): Module[] {
    return value.filter(m => m.category === category);
  }
}
