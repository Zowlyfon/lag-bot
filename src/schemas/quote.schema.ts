import {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDocument,
    RxJsonSchema,
    toTypedRxJsonSchema
} from 'rxdb';

export const quoteSchemaLiteral = {
    title: 'quote schema',
    version: 0,
    primaryKey: 'messageId',
    type: 'object',
    properties: {
        userId: {
            type: 'string',
            maxLength: 100
        },
        channelId: {
            type: 'string',
            maxLength: 100
        },
        guildId: {
            type: 'string',
            maxLength: 100
        },
        messageId: {
            type: 'string',
            maxLength: 100
        },
        messageTimestamp: {
            type: 'string'
        },
        content: {
            type: 'string'
        },
        savedById: {
            type: 'string',
            maxLength: 100
        }
    },
    required: ['userId', 'channelId', 'guildId', 'messageId', 'messageTimestamp', 'content', 'savedById'],
    indexes: ['userId', 'channelId', 'guildId', 'savedById']
} as const;

export const schemaTyped = toTypedRxJsonSchema(quoteSchemaLiteral);

export type QuoteDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const quoteSchema: RxJsonSchema<QuoteDocType> = quoteSchemaLiteral;

export type QuoteDocument = RxDocument<QuoteDocType>;

export type QuoteCollection = RxCollection<QuoteDocType>;