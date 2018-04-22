import { inject } from 'aurelia-dependency-injection';
import { Project, ProjectItem, CLIOptions, UI } from 'aurelia-cli';

var path = require('path');

@inject(Project, CLIOptions, UI)
export default class ElementGenerator {
  constructor(private project: Project, private options: CLIOptions, private ui: UI) { }

  execute() {
    let self = this;

    return this.ui
      .ensureAnswer(this.options.args[0], 'What would you like to call the component?')
      .then(name => {

        return self.ui.ensureAnswer(this.options.args[1], 'What sub-folder would you like to add it to?\nIf it doesn\'t exist it will be created for you.\n\nDefault folder is the source folder (src).', ".")
          .then(subFolders => {

            return self.ui.ensureAnswer(this.options.args[2], 'Is it state aware? (y for yes)')
              .then(isStateAware => {
                const stateAwareness = isStateAware === "y"
                let fileName = this.project.makeFileName(name);
                let className = this.project.makeClassName(name);

                const jsSource = stateAwareness
                  ? this.generateStateAwareJSSource(className)
                  : this.generateJSSource(className);

                self.project.root.add(
                  ProjectItem.text(path.join(subFolders, fileName + ".ts"), jsSource),
                  ProjectItem.text(path.join(subFolders, fileName + ".html"), this.generateHTMLSource(className))
                );

                return this.project.commitChanges()
                  .then(() => this.ui.log(`Created ${name} in the '${path.join(self.project.root.name, subFolders)}' folder`));

              });
          });
      });
  }

  generateJSSource(className) {
    return `export class ${className} {    
  message: string;
  
  constructor() { }
}`
  }
  generateStateAwareJSSource(className) {
    return `import { connectTo, Store } from 'aurelia-store';
import { autoinject } from 'aurelia-dependency-injection';
import { State } from '../state';

@autoinject()
@connectTo()
export class ${className} {
  public state: State;

  constructor(private store: Store<State>) { }

}`
  }

  generateHTMLSource(className) {
    return `<template>
</template>`
  }
}
