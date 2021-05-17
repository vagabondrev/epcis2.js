import Entity from '../Entity';
import EPCISHeader from './EPCISHeader';
import settings from '../../settings';
import objectToEvent from '../../utils/entityUtils';
import validateSchema from '../../schema/validator';

export default class EPCISDocument extends Entity {
  /**
   * You can either create an empty EPCISDocument or provide an already existing EPCIS document via
   * Map
   * @param {Object} [epcisDocument] - The object that will be used to create the EPCISDocument
   * entity
   */
  constructor(epcisDocument) {
    super(epcisDocument);
    this.isA = 'EPCISDocument';

    this.setUseEventListByDefault(settings.useEventListByDefault);

    if (!this.getContext()) {
      this.setContext(settings.EPCISDocumentContext);
    }

    if (!this.getSchemaVersion()) {
      this.setSchemaVersion(settings.EPCISDocumentSchemaVersion);
    }

    if (!this.getCreationDate()) {
      this.setCreationDate(new Date().toISOString());
    }

    if (!epcisDocument) {
      return;
    }

    // Create classes for sub-objects that are provided
    Object.entries(epcisDocument).forEach(([key, value]) => {
      switch (key) {
        case 'isA':
          this.isA = value;
          break;
        case 'epcisHeader':
          this.setEPCISHeader(new EPCISHeader(value));
          break;
        case 'epcisBody':
          if (value.event) {
            this.addEvent(objectToEvent(value.event));
            break;
          }
          if (value.eventList) {
            value.eventList.forEach((event) => this
              .addEvent(objectToEvent(event)));
            break;
          }
          break;
        // no default
      }
    });
  }

  /**
   * Set the isA property
   * @param {string} isA
   * @return {EPCISDocument} - the epcisDocument instance
   */
  setIsA(isA) {
    this.isA = isA;
    return this;
  }

  /**
   * Getter for the isA property
   * @return {string} - the isA property
   */
  getIsA() {
    return this.isA;
  }

  /**
   * Set the context property
   * @param {string|Object|Array<string>|Array<Object>} context
   * @return {EPCISDocument} - the epcisDocument instance
   */
  setContext(context) {
    this['@context'] = context;
    return this;
  }

  /**
   * Getter for the context property
   * @return {string|Object|Array<string>|Array<Object>} - the context
   */
  getContext() {
    return this['@context'];
  }

  /**
   * Set the schemaVersion property
   * @param {number} schemaVersion
   * @return {EPCISDocument} - the epcisDocument instance
   */
  setSchemaVersion(schemaVersion) {
    this.schemaVersion = schemaVersion;
    return this;
  }

  /**
   * Getter for the schemaVersion property
   * @return {number} - the schemaVersion
   */
  getSchemaVersion() {
    return this.schemaVersion;
  }

  /**
   * Set the creationDate property
   * @param {string} creationDate
   * @return {EPCISDocument} - the epcisDocument instance
   */
  setCreationDate(creationDate) {
    this.creationDate = creationDate;
    return this;
  }

  /**
   * Getter for the creationDate property
   * @return {string} - the creationDate
   */
  getCreationDate() {
    return this.creationDate;
  }

  /**
   * Set the format property
   * @param {string} format
   * @return {EPCISDocument} - the epcisDocument instance
   */
  setFormat(format) {
    this.format = format;
    return this;
  }

  /**
   * Getter for the format property
   * @return {string} - the format
   */
  getFormat() {
    return this.format;
  }

  /**
   * Set the useEventListByDefault property
   * @param {boolean} useEventListByDefault
   * @return {EPCISDocument} - the epcisDocument instance
   */
  setUseEventListByDefault(useEventListByDefault) {
    this.useEventListByDefault = useEventListByDefault;
    return this;
  }

  /**
   * Getter for the useEventListByDefault property
   * @return {boolean} - the useEventListByDefault
   */
  getUseEventListByDefault() {
    return this.useEventListByDefault;
  }

  /**
   * Set the epcisHeader property
   * @param {EPCISHeader} epcisHeader
   * @return {EPCISDocument} - the epcisDocument instance
   */
  setEPCISHeader(epcisHeader) {
    this.epcisHeader = epcisHeader;
    return this;
  }

  /**
   * Getter for the epcisHeader property
   * @return {EPCISHeader} - the epcisHeader
   */
  getEPCISHeader() {
    return this.epcisHeader;
  }

  /**
   * Add the event to the "eventList" field
   * @param {Event} event - the event to add
   * @return {EPCISDocument} - the epcisDocument instance
   */
  addEvent(event) {
    if (!this.eventList) {
      this.eventList = [];
    }
    this.eventList.push(event);
    return this;
  }

  /**
   * Add each event to the "eventList" field
   * @param {Array<Event>} eventList - the events to add
   * @return {EPCISDocument} - the epcisDocument instance
   */
  addEventList(eventList) {
    if (!this.eventList) {
      this.eventList = [];
    }
    this.eventList = [...this.eventList, ...eventList];
    return this;
  }

  /**
   * Clear the vocabularyList list
   * @return {EPCISDocument} - the epcisDocument instance
   */
  clearEventList() {
    delete this.eventList;
    return this;
  }

  /**
   * Remove the event from the "eventList" field
   * @param {Event} event - the events to remove
   * @return {EPCISDocument} - the epcisDocument instance
   */
  removeEvent(event) {
    this.eventList = this.eventList
      .filter((elem) => elem !== event);
    return this;
  }

  /**
   * Remove each event from the "eventList" field
   * @param {Array<Event>} eventList - the events to remove
   * @return {EPCISDocument} - the epcisDocument instance
   */
  removeEventList(eventList) {
    eventList.forEach((event) => this.removeEvent(event));
    return this;
  }

  /**
   * Getter for the eventList property
   * @return {Array<Event>} - the eventList
   */
  getEventList() {
    return this.eventList;
  }

  /**
   * Check if the EPCISDocument respects the rules of the standard defined in
   * src/schema/EPCISDocument.schema.json
   * @return {boolean} - true if the EPCIS document is valid
   * @throws {Error} - if the schema isn't valid
   */
  isValid() {
    validateSchema(this.toObject());
    return true;
  }

  /**
   * @return {Object} an object corresponding to the Entity object
   */
  toObject() {
    const output = super.toObject();
    delete output.useEventListByDefault;

    // check the settings to know if a single event has to be in the event field or eventList field.
    if (!this.useEventListByDefault && this.eventList.length < 2) {
      delete output.eventList;
      output.event = this.eventList.length ? this.eventList[0].toObject() : {};
    }

    // the event or event list has to be in the epcisBody field
    if (output.event || output.eventList) {
      const body = {};
      if (output.event) {
        body.event = output.event;
        delete output.event;
      } else {
        body.eventList = output.eventList;
        delete output.eventList;
      }
      output.epcisBody = body;
    }

    return output;
  }
}