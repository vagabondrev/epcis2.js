/**
 * (c) Copyright Reserved EVRYTHNG Limited 2021. All rights reserved.
 * Use of this material is subject to license.
 * Copying and unauthorised use of this material strictly prohibited.
 */

import { assert } from 'chai';
import {
  actionTypes, bizSteps, dispositions, ObjectEvent,
} from '../src';
import EPCISDocumentObjectEvent from './data/EPCISDocument-ObjectEvent.json';
import EPCISDocumentAggregationEvent from './data/EPCISDocument-AggregationEvent.json';
import EPCISDocumentTransformationEvent from './data/EPCISDocument-TransformationEvent.json';
import EPCISDocumentTransactionEvent from './data/EPCISDocument-TransactionEvent.json';
import EPCISDocumentAssociationEvent from './data/EPCISDocument-AssociationEvent.json';
import EPCISDocumentQueryDocument from './data/EPCISQueryDocument.json';
import EPCISDocument from '../src/entity/epcis/EPCISDocument';
import BizTransactionElement from '../src/entity/model/BizTransactionElement';

import {
  validateAgainstSchema,
  ensureFieldSet,
  validateEpcisDocument,
} from '../src/schema/validator';

/** Test documents with different event types inside */
const testData = {
  invalid: { foo: 'bar' },
  ObjectEvent: EPCISDocumentObjectEvent,
  AggregationEvent: EPCISDocumentAggregationEvent,
  TransformationEvent: EPCISDocumentTransformationEvent,
  AssociationEvent: EPCISDocumentAssociationEvent,
  QueryDocument: EPCISDocumentQueryDocument,
  TransactionEvent: EPCISDocumentTransactionEvent,
};

describe('validation of an EPCIS document', () => {
  describe('schema validation: valid', () => {
    it('should accept a valid EPCISDocument containing ObjectEvent', () => {
      assert.doesNotThrow(() => validateEpcisDocument(testData.ObjectEvent));
    });

    it('should accept a valid EPCISDocument containing ObjectEvent (2)', () => {
      const epcisDocument = new EPCISDocument();
      const objectEvent = new ObjectEvent();
      const bizTransaction = new BizTransactionElement({
        type: 'urn:epcglobal:cbv:btt:po',
        bizTransaction: 'http://transaction.acme.com/po/12345678',
      });

      objectEvent
        .setEventTime('2005-04-03T20:33:31.116-06:00')
        .addEPC('urn:epc:id:sgtin:0614141.107346.2020')
        .addEPC('urn:epc:id:sgtin:0614141.107346.2021')
        .setAction(actionTypes.observe)
        .setEventID('ni:///sha-256;87b5f18a69993f0052046d4687dfacdf48f?ver=CBV2.0')
        .setBizStep(bizSteps.shipping)
        .setDisposition(dispositions.in_transit)
        .setReadPoint('urn:epc:id:sgln:0614141.07346.1234')
        .addBizTransaction(bizTransaction);

      epcisDocument.setCreationDate('2005-07-11T11:30:47+00:00').addEvent(objectEvent);

      assert.doesNotThrow(() => epcisDocument.isValid());
    });

    it('should accept a valid EPCISDocument containing AggregationEvent', () => {
      assert.doesNotThrow(() => validateEpcisDocument(testData.AggregationEvent));
    });

    it('should accept a valid EPCISDocument containing TransactionEvent', () => {
      assert.doesNotThrow(() => validateEpcisDocument(testData.TransactionEvent));
    });

    it('should accept a valid EPCISDocument containing TransformationEvent', () => {
      assert.doesNotThrow(() => validateEpcisDocument(testData.TransformationEvent));
    });

    it('should accept a valid EPCISDocument containing ObjectEvent', () => {
      assert.doesNotThrow(() => validateEpcisDocument(testData.ObjectEvent));
    });

    it('should accept a valid EPCISDocument containing AssociationEvent', () => {
      assert.doesNotThrow(() => validateEpcisDocument(testData.AssociationEvent));
    });

    it('should accept a valid EPCISQueryDocument', () => {
      assert.doesNotThrow(() => validateEpcisDocument(testData.QueryDocument));
    });
  });

  describe('schema validation: invalid', () => {
    it('should reject an invalid object', () => {
      assert.throws(() => validateEpcisDocument(testData.invalid));
    });

    it('should reject an invalid EPCISDocument', () => {
      const copy = { ...testData.ObjectEvent };

      // Omit the events
      const { epcisBody, ...instance } = copy;

      assert.throws(() => validateEpcisDocument(instance));
    });

    it('should reject a valid EPCISDocument containing an invalid ObjectEvent', () => {
      const instance = { ...testData.ObjectEvent };

      // Introduce some error
      instance.epcisBody.eventList[0].action = 'OBSERVED';

      assert.throws(() => validateEpcisDocument(instance));
    });

    it('should reject a valid EPCISDocument containing an invalid AggregationEvent', () => {
      const instance = { ...testData.AggregationEvent };

      // Introduce some error
      instance.epcisBody.eventList[0].parentID = 'somebadid';

      assert.throws(() => validateEpcisDocument(instance));
    });

    it('should reject a valid EPCISDocument containing an invalid TransactionEvent', () => {
      const instance = { ...testData.TransactionEvent };

      // Introduce some error
      instance.epcisBody.eventList[0].action = 'NOT_VALID_ACTION_TYPE';

      assert.throws(() => validateEpcisDocument(instance));
    });

    it('should reject a valid EPCISDocument containing an invalid TransformationEvent', () => {
      const instance = { ...testData.TransformationEvent };

      // Introduce some error
      instance.epcisBody.eventList[0].eventTimeZoneOffset = '19:00';

      assert.throws(() => validateEpcisDocument(instance));
    });

    it('should reject a valid EPCISDocument containing an invalid AssociationEvent', () => {
      const instance = { ...testData.AssociationEvent };

      // Introduce some error
      instance.epcisBody.eventList[0].action = 'ADDED';

      assert.throws(() => validateEpcisDocument(instance));
    });

    it('should reject an invalid EPCISQueryDocument', () => {
      const copy = { ...testData.QueryDocument };

      // Omit the query results
      const instance = {
        ...copy,
        epcisBody: {},
      };

      assert.throws(() => validateEpcisDocument(instance));
    });
  });
});

describe('Unit test: validator.js', () => {
  describe('validateAgainstSchema', () => {
    it('should throw for unknown schema name', () => {
      assert.throws(() => validateAgainstSchema({}, 'invalidName'));
    });
  });

  describe('ensureFieldSet', () => {
    it('should throw for unknown fieldSet name', () => {
      assert.throws(() => ensureFieldSet({}, 'invalidName'));
    });
  });

  describe('validateEpcisDocument', () => {
    it('should accept correct EPCISDocument', () => {
      const epcisD = {
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',

        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'ObjectEvent',
              action: 'OBSERVE',
              bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
              disposition: 'urn:epcglobal:cbv:disp:in_transit',
              epcList: ['urn:epc:id:sgtin:0614141.107346.2017'],
              eventTime: '2005-04-03T20:33:31.116000-06:00',
              eventTimeZoneOffset: '-06:00',
              readPoint: { id: 'urn:epc:id:sgln:0614141.07346.1234' },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:po',
                  bizTransaction: 'http://transaction.acme.com/po/12345678',
                },
              ],
            },
          ],
        },
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
      };
      const res = validateEpcisDocument(epcisD);
      assert.equal(res.success, true);
      assert.deepEqual(res.errors, []);
    });

    it('should reject incorrect EPCISDocument', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: 2,
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'ObjectEvent',
              action: 'OBSERVE',
              bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
              disposition: 'urn:epcglobal:cbv:disp:in_transit',
              epcList: ['urn:epc:id:sgtin:0614141.107346.2017'],
              eventTime: '2005-04-03T20:33:31.116000-06:00',
              eventTimeZoneOffset: '-06:00',
              readPoint: { id: 'urn:epc:id:sgln:0614141.07346.1234' },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:po',
                  bizTransaction: 'http://transaction.acme.com/po/12345678',
                },
              ],
            },
          ],
        },
      };

      assert.throws(() => { validateEpcisDocument(epcisDocument); });
    });

    it('should reject correct EPCISDocument with invalid event', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'ObjectEvent',
              bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
              disposition: 'urn:epcglobal:cbv:disp:in_transit',
              epcList: ['urn:epc:id:sgtin:0614141.107346.2017'],
              eventTime: '2005-04-03T20:33:31.116000-06:00',
              eventTimeZoneOffset: '-06:00',
              readPoint: { id: 'urn:epc:id:sgln:0614141.07346.1234' },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:po',
                  bizTransaction: 'http://transaction.acme.com/po/12345678',
                },
              ],
            },
          ],
        },
      };

      assert.throws(() => { validateEpcisDocument(epcisDocument); });
    });

    it('should accept correct event with event extensions', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'ObjectEvent',
              'evt:factoryId': 'foobar',
              action: 'OBSERVE',
              bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
              disposition: 'urn:epcglobal:cbv:disp:in_transit',
              epcList: ['urn:epc:id:sgtin:0614141.107346.2017'],
              eventTime: '2005-04-03T20:33:31.116000-06:00',
              eventTimeZoneOffset: '-06:00',
              readPoint: { id: 'urn:epc:id:sgln:0614141.07346.1234' },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:po',
                  bizTransaction: 'http://transaction.acme.com/po/12345678',
                },
              ],
            },
          ],
        },
      };

      const res = validateEpcisDocument(epcisDocument);
      assert.equal(res.success, true);
      assert.deepEqual(res.errors, []);
    });

    it('should reject incorrect event with invalid event extensions', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'ObjectEvent',
              factoryId: 'foobar',
              action: 'OBSERVE',
              bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
              disposition: 'urn:epcglobal:cbv:disp:in_transit',
              epcList: ['urn:epc:id:sgtin:0614141.107346.2017'],
              eventTime: '2005-04-03T20:33:31.116000-06:00',
              eventTimeZoneOffset: '-06:00',
              readPoint: { id: 'urn:epc:id:sgln:0614141.07346.1234' },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:po',
                  bizTransaction: 'http://transaction.acme.com/po/12345678',
                },
              ],
            },
          ],
        },
      };

      assert.throws(() => { validateEpcisDocument(epcisDocument); });
    });

    it('should reject incorrect event with invalid eventId field', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventId: 'test:event:id',
              type: 'ObjectEvent',
              action: 'OBSERVE',
              bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
              disposition: 'urn:epcglobal:cbv:disp:in_transit',
              epcList: ['urn:epc:id:sgtin:0614141.107346.2017'],
              eventTime: '2005-04-03T20:33:31.116000-06:00',
              eventTimeZoneOffset: '-06:00',
              readPoint: { id: 'urn:epc:id:sgln:0614141.07346.1234' },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:po',
                  bizTransaction: 'http://transaction.acme.com/po/12345678',
                },
              ],
            },
          ],
        },
      };

      assert.throws(() => { validateEpcisDocument(epcisDocument); });
    });

    it('should accept correct sensorElementList with no extensions', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'ObjectEvent',
              action: 'OBSERVE',
              bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
              disposition: 'urn:epcglobal:cbv:disp:in_transit',
              epcList: [
                'urn:epc:id:sgtin:0614141.107346.2017',
                'urn:epc:id:sgtin:0614141.107346.2018',
              ],
              eventTime: '2005-04-03T20:33:31.116-06:00',
              eventTimeZoneOffset: '-06:00',
              readPoint: {
                id: 'urn:epc:id:sgln:0614141.07346.1234',
              },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:po',
                  bizTransaction: 'http://transaction.acme.com/po/12345678',
                },
              ],
              sensorElementList: [
                {
                  sensorMetadata: { time: '2019-04-02T14:55:00.000+01:00' },
                  sensorReport: [
                    {
                      type: 'gs1:MeasurementType-Temperature',
                      value: 26.0,
                      uom: 'CEL',
                      deviceID: 'urn:epc:id:giai:4000001.111',
                      deviceMetadata: 'https://id.gs1.org/giai/4000001111',
                      rawData: 'https://example.org/giai/401234599999',
                    },
                    {
                      type: 'gs1:MeasurementType-Humidity',
                      value: 12.1,
                      uom: 'A93',
                      deviceID: 'urn:epc:id:giai:4000001.222',
                      deviceMetadata: 'https://id.gs1.org/giai/4000001222',
                      rawData: 'https://example.org/giai/401234599999',
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const res = validateEpcisDocument(epcisDocument);
      assert.equal(res.success, true);
      assert.deepEqual(res.errors, []);
    });

    it('should accept correct sensorElementList with valid extensions', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'ObjectEvent',
              action: 'OBSERVE',
              bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
              disposition: 'urn:epcglobal:cbv:disp:in_transit',
              epcList: [
                'urn:epc:id:sgtin:0614141.107346.2017',
                'urn:epc:id:sgtin:0614141.107346.2018',
              ],
              eventTime: '2005-04-03T20:33:31.116-06:00',
              eventTimeZoneOffset: '-06:00',
              readPoint: {
                id: 'urn:epc:id:sgln:0614141.07346.1234',
                'example:extension': 'factoryId',
              },
              bizLocation: {
                id: 'urn:epc:id:sgln:9529999.99999.0',
                'evt:factoryId': '8934897894',
              },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:po',
                  bizTransaction: 'http://transaction.acme.com/po/12345678',
                },
              ],
              sensorElementList: [
                {
                  'example:furtherEventData': [
                    { 'example:data1': '123.5' },
                    { 'example:data2': '0.987' },
                  ],
                  sensorMetadata: { time: '2019-04-02T14:55:00.000+01:00' },
                  sensorReport: [
                    {
                      type: 'gs1:MeasurementType-Temperature',
                      value: 26.0,
                      uom: 'CEL',
                      deviceID: 'urn:epc:id:giai:4000001.111',
                      deviceMetadata: 'https://id.gs1.org/giai/4000001111',
                      rawData: 'https://example.org/giai/401234599999',
                    },
                    {
                      type: 'gs1:MeasurementType-Humidity',
                      value: 12.1,
                      uom: 'A93',
                      deviceID: 'urn:epc:id:giai:4000001.222',
                      deviceMetadata: 'https://id.gs1.org/giai/4000001222',
                      rawData: 'https://example.org/giai/401234599999',
                    },
                  ],
                },
              ],
              'example:furtherEventData': [
                { 'example:data1': '123.5' },
                { 'example:data2': '0.987' },
              ],
            },
          ],
        },
      };

      const res = validateEpcisDocument(epcisDocument);
      assert.equal(res.success, true);
      assert.deepEqual(res.errors, []);
    });

    it('should reject correct sensorElementList with invalid extensions', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'ObjectEvent',
              action: 'OBSERVE',
              bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
              disposition: 'urn:epcglobal:cbv:disp:in_transit',
              epcList: [
                'urn:epc:id:sgtin:0614141.107346.2017',
                'urn:epc:id:sgtin:0614141.107346.2018',
              ],
              eventTime: '2005-04-03T20:33:31.116-06:00',
              eventTimeZoneOffset: '-06:00',
              readPoint: {
                id: 'urn:epc:id:sgln:0614141.07346.1234',
                'example:extension': 'factoryId',
              },
              bizLocation: {
                id: 'urn:epc:id:sgln:9529999.99999.0',
                'evt:factoryId': '8934897894',
              },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:po',
                  bizTransaction: 'http://transaction.acme.com/po/12345678',
                },
              ],
              sensorElementList: [
                {
                  furtherEventData: [{ 'example:data1': '123.5' }, { 'example:data2': '0.987' }],
                  sensorMetadata: { time: '2019-04-02T14:55:00.000+01:00' },
                  sensorReport: [
                    {
                      type: 'gs1:MeasurementType-Temperature',
                      value: 26.0,
                      uom: 'CEL',
                      deviceID: 'urn:epc:id:giai:4000001.111',
                      deviceMetadata: 'https://id.gs1.org/giai/4000001111',
                      rawData: 'https://example.org/giai/401234599999',
                    },
                    {
                      type: 'gs1:MeasurementType-Humidity',
                      value: 12.1,
                      uom: 'A93',
                      deviceID: 'urn:epc:id:giai:4000001.222',
                      deviceMetadata: 'https://id.gs1.org/giai/4000001222',
                      rawData: 'https://example.org/giai/401234599999',
                    },
                  ],
                },
              ],
              'example:furtherEventData': [
                { 'example:data1': '123.5' },
                { 'example:data2': '0.987' },
              ],
            },
          ],
        },
      };

      assert.throws(() => { validateEpcisDocument(epcisDocument); });
    });

    it('should accept AggregationEvent with no extensions', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'AggregationEvent',
              eventTime: '2020-06-08T18:11:16Z',
              eventTimeZoneOffset: '+02:00',
              parentID: 'urn:epc:id:sgtin:952001.1012345.22222223333',
              childEPCs: [
                'urn:epc:id:sgtin:9520001.012346.10000001001',
                'urn:epc:id:sgtin:9520001.012346.10000001002',
                'urn:epc:id:sgtin:9520001.012346.10000001003',
              ],
              action: 'DELETE',
              bizStep: 'urn:epcglobal:cbv:bizstep:unpacking',
              disposition: 'urn:epcglobal:cbv:disp:in_progress',
              readPoint: { id: 'urn:epc:id:sgln:9529999.99999.0' },
              bizLocation: { id: 'urn:epc:id:sgln:9529999.99999.0' },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:inv',
                  bizTransaction: 'urn:epcglobal:cbv:bt:9520011111116:A123',
                },
              ],
              sourceList: [
                {
                  type: 'urn:epcglobal:cbv:sdt:owning_party',
                  source: 'urn:epc:id:pgln:9520001.11111',
                },
              ],
              destinationList: [
                {
                  type: 'urn:epcglobal:cbv:sdt:owning_party',
                  destination: 'urn:epc:id:pgln:9520999.99999',
                },
              ],
              persistentDisposition: {
                unset: ['urn:epcglobal:cbv:disp:completeness_inferred'],
                set: ['urn:epcglobal:cbv:disp:completeness_verified'],
              },
              errorDeclaration: {
                declarationTime: '2020-01-14T23:00:00.000+00:00',
                reason: 'urn:epcglobal:cbv:er:incorrect_data',
                correctiveEventIDs: ['urn:uuid:404d95fc-9457-4a51-bd6a-0bba133845a8'],
              },
            },
          ],
        },
      };

      const res = validateEpcisDocument(epcisDocument);
      assert.equal(res.success, true);
      assert.deepEqual(res.errors, []);
    });

    it('should reject AggregationEvent with invalid extensions', () => {
      const epcisDocument = {
        '@context': ['https://gs1.github.io/EPCIS/epcis-context.jsonld'],
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2005-07-11T11:30:47.0Z',
        epcisBody: {
          eventList: [
            {
              eventID: 'test:event:id',
              type: 'AggregationEvent',
              eventTime: '2020-06-08T18:11:16Z',
              eventTimeZoneOffset: '+02:00',
              parentID: 'urn:epc:id:sgtin:952001.1012345.22222223333',
              childEPCs: [
                'urn:epc:id:sgtin:9520001.012346.10000001001',
                'urn:epc:id:sgtin:9520001.012346.10000001002',
                'urn:epc:id:sgtin:9520001.012346.10000001003',
              ],
              action: 'DELETE',
              bizStep: 'urn:epcglobal:cbv:bizstep:unpacking',
              disposition: 'urn:epcglobal:cbv:disp:in_progress',
              readPoint: { id: 'urn:epc:id:sgln:9529999.99999.0' },
              bizLocation: { id: 'urn:epc:id:sgln:9529999.99999.0' },
              bizTransactionList: [
                {
                  type: 'urn:epcglobal:cbv:btt:inv',
                  bizTransaction: 'urn:epcglobal:cbv:bt:9520011111116:A123',
                },
              ],
              sourceList: [
                {
                  type: 'urn:epcglobal:cbv:sdt:owning_party',
                  source: 'urn:epc:id:pgln:9520001.11111',
                },
              ],
              destinationList: [
                {
                  type: 'urn:epcglobal:cbv:sdt:owning_party',
                  destination: 'urn:epc:id:pgln:9520999.99999',
                },
              ],
              persistentDisposition: {
                unset: ['urn:epcglobal:cbv:disp:completeness_inferred'],
                set: ['urn:epcglobal:cbv:disp:completeness_verified'],
              },
              errorDeclaration: {
                declarationTime: '2020-01-14T23:00:00.000+00:00',
                reason: 'urn:epcglobal:cbv:er:incorrect_data',
                correctiveEventIDs: ['urn:uuid:404d95fc-9457-4a51-bd6a-0bba133845a8'],
                evtErrorCode: 1239,
              },
            },
          ],
        },
      };

      assert.throws(() => { validateEpcisDocument(epcisDocument); });
    });

    it('should accept TransformationEvent various quantity list types', () => {
      const epcisDocument = {
        type: 'EPCISDocument',
        schemaVersion: '2.0',
        creationDate: '2013-06-04T14:59:02.099+02:00',
        epcisBody: {
          eventList: [
            {
              type: 'TransformationEvent',
              eventTime: '2013-10-31T14:58:56.591Z',
              eventTimeZoneOffset: '+02:00',
              inputEPCList: [
                'urn:epc:id:sgtin:4012345.011122.25',
                'urn:epc:id:sgtin:4000001.065432.99886655',
              ],
              inputQuantityList: [
                {
                  epcClass: 'urn:epc:class:lgtin:4012345.011111.4444',
                  quantity: 10,
                  uom: 'KGM',
                },
                {
                  epcClass: 'urn:epc:class:lgtin:0614141.077777.987',
                  quantity: 30,
                },
                {
                  epcClass: 'urn:epc:idpat:sgtin:4012345.066666.*',
                  quantity: 220,
                },
              ],
              outputEPCList: [
                'urn:epc:id:sgtin:4012345.077889.25',
                'urn:epc:id:sgtin:4012345.077889.26',
                'urn:epc:id:sgtin:4012345.077889.27',
                'urn:epc:id:sgtin:4012345.077889.28',
              ],
              outputQuantityList: [
                {
                  epcClass: 'urn:epc:class:lgtin:4012345.011111.4444',
                  quantity: 10,
                  uom: 'KGM',
                },
                {
                  epcClass: 'urn:epc:class:lgtin:0614141.077777.987',
                  quantity: 30,
                },
                {
                  epcClass: 'urn:epc:idpat:sgtin:4012345.066666.*',
                  quantity: 220,
                },
              ],
              transformationID: 'urn:epc:id:gdti:0614141.12345.400',
              bizStep: 'commissioning',
              disposition: 'in_progress',
              readPoint: {
                id: 'urn:epc:id:sgln:4012345.00001.0',
              },
              bizLocation: {
                id: 'urn:epc:id:sgln:0614141.00888.0',
              },
              bizTransactionList: [
                {
                  type: 'po',
                  bizTransaction: 'urn:epc:id:gdti:0614141.00001.1618034',
                },
                {
                  type: 'pedigree',
                  bizTransaction: 'urn:epc:id:gsrn:0614141.0000010253',
                },
              ],
              sourceList: [
                {
                  type: 'location',
                  source: 'urn:epc:id:sgln:4012345.00225.0',
                },
                {
                  type: 'possessing_party',
                  source: 'urn:epc:id:pgln:4012345.00225',
                },
                {
                  type: 'owning_party',
                  source: 'urn:epc:id:pgln:4012345.00225',
                },
              ],
              destinationList: [
                {
                  type: 'location',
                  destination: 'urn:epc:id:sgln:0614141.00777.0',
                },
                {
                  type: 'possessing_party',
                  destination: 'urn:epc:id:pgln:0614141.00777',
                },
                {
                  type: 'owning_party',
                  destination: 'urn:epc:id:pgln:0614141.00777',
                },
              ],
              ilmd: {
                'ext1:float': '20',
                'ext1:array': [
                  '12',
                  '22',
                  '2013-06-08T14:58:56.591Z',
                  'true',
                  'stringInArray',
                  {
                    'ext1:object': {
                      'ext1:object': {
                        'ext2:array': [
                          '14',
                          '23.0',
                          'stringInArrayInObjectInArray',
                        ],
                        'ext2:object': {
                          'ext2:object': {
                            'ext3:string': 'stringInObjectInObjectInArray',
                          },
                        },
                        'ext2:int': '13',
                        'ext2:string': 'stringInObjectInArray',
                      },
                    },
                  },
                ],
                'ext1:object': {
                  'ext2:array': [
                    '11',
                    '21',
                    'stringInArrayInObject',
                  ],
                  'ext2:object': {
                    'ext2:object': {
                      'ext3:string': 'stringInObjectInObject',
                    },
                  },
                  'ext2:string': 'stringInObject',
                },
                'cbvmda:countryOfExport': 'KR',
                'cbvmda:grossWeight': '3.5',
                'ext1:int': '10',
                'cbvmda:netWeight': '3.5',
                'ext1:time': '2013-06-08T14:58:56.591Z',
                'ext1:boolean': 'true',
                'ext1:default': 'stringAsDefaultValue',
                'ext1:string': 'string',
                'cbvmda:countryOfOrigin': 'GB',
                'cbvmda:drainedWeight': '3.5',
                'cbvmda:lotNumber': 'ABC123',
              },
              sensorElementList: [
                {
                  sensorMetadata: {
                    time: '2019-04-02T13:05:00.000Z',
                    deviceID: 'urn:epc:id:giai:4000001.111',
                    deviceMetadata: 'https://id.gs1.org/giai/4000001111',
                    rawData: 'https://example.org/giai/401234599999',
                    startTime: '2019-04-02T12:55:01.000Z',
                    endTime: '2019-04-02T13:55:00.000Z',
                    dataProcessingMethod: 'https://example.com/gdti/4012345000054987',
                    bizRules: 'https://example.com/gdti/4012345000054987',
                    'ext1:someFurtherMetadata': 'someText',
                  },
                  sensorReport: [
                    {
                      type: 'Temperature',
                      deviceID: 'urn:epc:id:giai:4000001.111',
                      rawData: 'https://example.org/giai/401234599999',
                      dataProcessingMethod: 'https://example.com/gdti/4012345000054987',
                      time: '2019-07-19T13:00:00.000Z',
                      microorganism: 'https://www.ncbi.nlm.nih.gov/taxonomy/1126011',
                      chemicalSubstance: 'https://identifiers.org/inchikey:CZMRCDWAGMRECN-UGDNZRGBSA-N',
                      value: 26,
                      component: 'example:x',
                      stringValue: 'SomeString',
                      booleanValue: true,
                      hexBinaryValue: 'f0f0f0',
                      uriValue: 'https://id.gs1.org/giai/4000001111',
                      minValue: 26,
                      maxValue: 26.2,
                      meanValue: 13.2,
                      percRank: 50,
                      percValue: 12.7,
                      uom: 'CEL',
                      sDev: 0.1,
                      'ext1:someFurtherReportData': 'someText',
                      deviceMetadata: 'https://id.gs1.org/giai/4000001111',
                    },
                  ],
                  'ext1:float': '20',
                  'ext1:time': '2013-06-08T14:58:56.591Z',
                  'ext1:array': [
                    '12',
                    '22',
                    '2013-06-08T14:58:56.591Z',
                    'true',
                    'stringInArray',
                    {
                      'ext1:object': {
                        'ext1:object': {
                          'ext2:array': [
                            '14',
                            '23.0',
                            'stringInArrayInObjectInArray',
                          ],
                          'ext2:object': {
                            'ext2:object': {
                              'ext3:string': 'stringInObjectInObjectInArray',
                            },
                          },
                          'ext2:int': '13',
                          'ext2:string': 'stringInObjectInArray',
                        },
                      },
                    },
                  ],
                  'ext1:boolean': 'true',
                  'ext1:object': {
                    'ext2:array': [
                      '11',
                      '21',
                      'stringInArrayInObject',
                    ],
                    'ext2:object': {
                      'ext2:object': {
                        'ext3:string': 'stringInObjectInObject',
                      },
                    },
                    'ext2:string': 'stringInObject',
                  },
                  'ext1:default': 'stringAsDefaultValue',
                  'ext1:int': '10',
                  'ext1:string': 'string',
                },
              ],
              persistentDisposition: {
                set: [
                  'completeness_verified',
                ],
                unset: [
                  'completeness_inferred',
                ],
              },
              'ext1:float': '20',
              'ext1:time': '2013-06-08T14:58:56.591Z',
              'ext1:array': [
                '12',
                '22',
                '2013-06-08T14:58:56.591Z',
                'true',
                'stringInArray',
                {
                  'ext1:object': {
                    'ext1:object': {
                      'ext2:array': [
                        '14',
                        '23.0',
                        'stringInArrayInObjectInArray',
                      ],
                      'ext2:object': {
                        'ext2:object': {
                          'ext3:string': 'stringInObjectInObjectInArray',
                        },
                      },
                      'ext2:int': '13',
                      'ext2:string': 'stringInObjectInArray',
                    },
                  },
                },
              ],
              'ext1:boolean': 'true',
              'ext1:object': {
                'ext2:array': [
                  '11',
                  '21',
                  'stringInArrayInObject',
                ],
                'ext2:object': {
                  'ext2:object': {
                    'ext3:string': 'stringInObjectInObject',
                  },
                },
                'ext2:string': 'stringInObject',
              },
              'ext1:default': 'stringAsDefaultValue',
              'ext1:int': '10',
              'ext1:string': 'string',
            },
          ],
        },
        '@context': [
          'https://gs1.github.io/EPCIS/epcis-context.jsonld',
          {
            ext3: 'http://example.com/ext3/',
          },
          {
            ext2: 'http://example.com/ext2/',
          },
          {
            ext1: 'http://example.com/ext1/',
          },
        ],
      };

      const res = validateEpcisDocument(epcisDocument);
      assert.equal(res.success, true);
      assert.deepEqual(res.errors, []);
    });
  });
});
