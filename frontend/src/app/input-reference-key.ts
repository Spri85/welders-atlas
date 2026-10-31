import { Component, computed, input } from '@angular/core';
import type { Language } from './export-copy';

export interface InputReference {
  id: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-input-reference-key',
  template: `
    @if (parameters().length) {
      <section class="input-references" [attr.aria-label]="heading()">
        <h3>{{ heading() }}</h3>
        <dl>
          @for (parameter of parameters(); track parameter.id) {
            <div [attr.data-input-reference]="parameter.id">
              <dt>
                <strong>{{ parameter.id }}</strong> {{ parameter.label }}
              </dt>
              <dd>{{ parameter.value }}</dd>
            </div>
          }
        </dl>
      </section>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .input-references {
      padding: 14px 16px;
      margin-block: 12px 20px;
      background: #eeeee7;
      border: 1px solid #d8ddd8;
      border-radius: 4px;
    }
    h3 {
      margin: 0 0 12px;
      font-size: 14px;
      color: #526267;
    }
    dl {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
      gap: 12px 20px;
      margin: 0;
    }
    dt {
      font-size: 14px;
      line-height: 1.5;
    }
    dt strong {
      color: #8a491f;
      margin-right: 6px;
    }
    dd {
      margin: 4px 0 0;
      font-size: 16px;
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
  `,
})
export class InputReferenceKey {
  readonly parameters = input<readonly InputReference[]>([]);
  readonly language = input<Language>('ua');
  readonly heading = computed(
    () =>
      ({
        en: 'Input references',
        ua: 'Позначення вхідних параметрів',
        ru: 'Обозначения входных параметров',
      })[this.language()],
  );
}
