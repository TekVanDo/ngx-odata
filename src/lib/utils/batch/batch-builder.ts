import { UUID } from 'angular2-uuid';
import { Buildable } from '../../operations';
import { ChangeSet } from './change-set';

export class BatchBuilder implements Buildable {

  private _uuid: string;
  private validationMessage: string;

  private changeSets: ChangeSet [] = [];

  constructor() {
    this._uuid = UUID.UUID();
  }

  get uuid(): string {
    return this._uuid;
  }

  addChangeSet(changeSet: ChangeSet): BatchBuilder {
    this.changeSets.push(changeSet);
    return this;
  }

  public build(): string {
    const batch = [];
    if (this.validate()) {
      // TODO support read queries
      // process change sets
      for (const changeSet of this.changeSets) {
        batch.push(`--batch_${this._uuid}`);
        batch.push(changeSet.build());
      }
      batch.push(`--batch_${this._uuid}--`);
      const batchString = batch.join('\r\n');
      return batchString;
    } else {
      throw new Error(`Invalid batch: ${this.validationMessage}`);
    }
  }

  public validate(): boolean {
    this.validationMessage = '';
    return true;
  }

}
