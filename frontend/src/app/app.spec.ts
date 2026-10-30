import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('Welder’s Atlas shell', () => {
  beforeEach(() => {
    document.documentElement.lang = 'uk';
  });

  it('renders the selected language and updates document metadata through the controls', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Атлас зварника');
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Атлас сварщика');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    buttons[2].click();
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('en');
    expect(fixture.nativeElement.textContent).toContain('Welder’s Atlas');
    buttons[0].click();
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('uk');
  });
});
