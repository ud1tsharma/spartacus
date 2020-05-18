import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import path from 'path';
import { Schema as SpartacusOptions } from '../ng-add/schema';

const collectionPath = path.join(__dirname, '../collection.json');

describe('Spartacus Schematics: ng-add', () => {
  const schematicRunner = new SchematicTestRunner('schematics', collectionPath);

  let appTree: UnitTestTree;

  const workspaceOptions: any = {
    name: 'workspace',
    version: '0.5.0',
  };

  const appOptions: any = {
    name: 'schematics-test',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'scss',
    skipTests: false,
    projectRoot: '',
  };

  const defaultOptions: SpartacusOptions = {
    project: 'schematics-test',
    'default-base-sites': '',
    'default-routing': '',
    'test-outlets': '',
  };

  beforeEach(async () => {
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        appOptions,
        appTree
      )
      .toPromise();
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@spartacus/schematics',
        'ng-add',
        defaultOptions,
        appTree
      )
      .toPromise();
  });

  it('should add pre-defined routing', async () => {
    const tree = await schematicRunner
      .runSchematicAsync(
        'ng-add',
        { ...defaultOptions, 'default-routing': true },
        appTree
      )
      .toPromise();

    const appModule = tree.readContent('/src/app/app.module.ts');

    expect(appModule).toContain('routing:');
    expect(appModule).toContain(
      "paths: ['product/:productCode/:name', 'product/:productCode']"
    );
  });
});
