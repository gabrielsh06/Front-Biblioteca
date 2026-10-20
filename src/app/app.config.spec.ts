import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { appConfig } from './app.config';

describe('appConfig', () => {
    it('no requiere Zone.js para arrancar (app zoneless)', () => {
        TestBed.configureTestingModule({ providers: appConfig.providers });

        expect(() => TestBed.inject(NgZone)).not.toThrow();
    });
});
