import { HttpRequestObject } from './interfaces';
import { Buildable } from '../../operations/buildable';
import { HttpRequestBuilder } from './../../../../http-request-buider/http-request-builder';
import { UUID } from 'angular2-uuid';

export class ChangeSet implements Buildable {

  private uuid: string;
  private operations: ChangeSetOperation [] = [];

  constructor() {
    this.uuid = UUID.UUID();
  }

  addOperation(operation: ChangeSetOperation) {
    this.operations.push(operation);
  }

  build(): string {
    const changeSet = [];
    changeSet.push(`Content-Type: multipart/mixed;boundary=change_set_${this.uuid}`);
    for (const op of this.operations) {
      changeSet.push('');
      changeSet.push(`--change_set_${this.uuid}`);
      changeSet.push(op.build());
    }
    changeSet.push('');
    changeSet.push(`--change_set_${this.uuid}--`);
    return changeSet.join('\r\n');
  }
}

export class ChangeSetOperation implements Buildable {

  public contentType = 'application/http';
  public transferEncoding = 'binary';
  public contentId: string;

  private request: HttpRequestObject;

  setRequest(req: HttpRequestObject): ChangeSetOperation {
    this.request = req;
    return this;
  }

  build(): string {
    const op = [];
    if (this.contentType) {
      op.push(`Content-Type: ${this.contentType}`);
    }
    if (this.transferEncoding) {
      op.push(`Content-Transfer-Encoding:${this.transferEncoding}`);
    }
    if (this.contentId) {
      op.push(`Content-ID: ${this.contentId}`);
    }
    if (this.request) {
      op.push('');
      op.push(new HttpRequestBuilder(false).build(this.request));
    }
    return op.join('\r\n');
  }

}
