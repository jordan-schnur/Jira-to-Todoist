// Generated by https://transform.tools/json-schema-to-typescript

export interface SearchResults {
    expand: string
    startAt: number
    maxResults: number
    total: number
    issues: Issue[]
    warningMessages: string[]
    names: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` ".+".
       */
      [k: string]: string
    }
    schema: {
      [k: string]: JsonType
    }
  }
  export interface Issue {
    expand: string
    id: string
    self: string
    key: string
    fields: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` ".+".
       */
      [k: string]: unknown
    }
    renderedFields: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` ".+".
       */
      [k: string]: unknown
    }
    properties: Properties
    names: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` ".+".
       */
      [k: string]: string
    }
    schema: {
      [k: string]: JsonType
    }
    transitions: Transition[]
    operations: Opsbar
    editmeta: EditMeta
    changelog: Changelog
    versionedRepresentations: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` ".+".
       */
      [k: string]: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` ".+".
         */
        [k: string]: unknown
      }
    }
    fieldsToInclude: IncludedFields
  }
  export interface Properties {
    properties: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` ".+".
       */
      [k: string]: string
    }
  }
  /**
   * This interface was referenced by `undefined`'s JSON-Schema definition
   * via the `patternProperty` ".+".
   *
   * This interface was referenced by `undefined`'s JSON-Schema definition
   * via the `patternProperty` ".+".
   */
  export interface JsonType {
    type: string
    items: string
    system: string
    custom: string
    customId: number
  }
  export interface Transition {
    id: string
    name: string
    to: Status
    fields: {
      [k: string]: FieldMeta
    }
    expand: string
  }
  export interface Status {
    self: string
    statusColor: string
    description: string
    iconUrl: string
    name: string
    id: string
    statusCategory: StatusCategory
  }
  export interface StatusCategory {
    self: string
    id: number
    key: string
    colorName: string
    name: string
  }
  /**
   * This interface was referenced by `undefined`'s JSON-Schema definition
   * via the `patternProperty` ".+".
   *
   * This interface was referenced by `undefined`'s JSON-Schema definition
   * via the `patternProperty` ".+".
   */
  export interface FieldMeta {
    required: boolean
    schema: JsonType
    name: string
    autoCompleteUrl: string
    hasDefaultValue: boolean
    operations: string[]
    allowedValues: unknown[]
  }
  export interface Opsbar {
    linkGroups: LinkGroup[]
  }
  export interface LinkGroup {
    id: string
    styleClass: string
    header: SimpleLink
    weight: number
    links: SimpleLink[]
    groups: LinkGroup[]
  }
  export interface SimpleLink {
    id: string
    styleClass: string
    iconClass: string
    label: string
    title: string
    href: string
    weight: number
  }
  export interface EditMeta {
    fields: {
      [k: string]: FieldMeta
    }
  }
  export interface Changelog {
    startAt: number
    maxResults: number
    total: number
    histories: ChangeHistory[]
  }
  export interface ChangeHistory {
    id: string
    author: User
    created: string
    items: ChangeItem[]
    historyMetadata: HistoryMetadata
  }
  export interface User {
    self: string
    name: string
    key: string
    emailAddress: string
    avatarUrls: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` ".+".
       */
      [k: string]: string
    }
    displayName: string
    active: boolean
    timeZone: string
  }
  export interface ChangeItem {
    field: string
    fieldtype: string
    from: string
    fromString: string
    to: string
    toString: string
  }
  export interface HistoryMetadata {
    type: string
    description: string
    descriptionKey: string
    activityDescription: string
    activityDescriptionKey: string
    emailDescription: string
    emailDescriptionKey: string
    actor: HistoryMetadataParticipant
    generator: HistoryMetadataParticipant
    cause: HistoryMetadataParticipant
    extraData: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` ".+".
       */
      [k: string]: string
    }
  }
  export interface HistoryMetadataParticipant {
    id: string
    displayName: string
    displayNameKey: string
    type: string
    avatarUrl: string
    url: string
  }
  export interface IncludedFields {
    [k: string]: unknown
  }
  