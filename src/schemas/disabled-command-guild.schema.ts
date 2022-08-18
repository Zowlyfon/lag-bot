import {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDocument,
    RxJsonSchema,
    toTypedRxJsonSchema
} from 'rxdb';

export const disabledCommandGuildSchemaLiteral = {
    title: 'disabled command guild schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
          type: 'string',
            maxLength: 100
        },
        guildId: {
            type: 'string',
            maxLength: 100
        },
        command: {
            type: 'string',
            maxLength: 100
        }
    },
    required: ['guildId', 'command'],
    indexes: ['guildId', 'command']
} as const;

const schemaTyped = toTypedRxJsonSchema(disabledCommandGuildSchemaLiteral);

export type DisabledCommandGuildDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const disabledCommandGuildSchema: RxJsonSchema<DisabledCommandGuildDocType> = disabledCommandGuildSchemaLiteral;

export type DisabledCommandGuildDocument = RxDocument<DisabledCommandGuildDocType>;

export type DisabledCommandGuildCollection = RxCollection<DisabledCommandGuildDocType>;