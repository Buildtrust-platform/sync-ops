"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Icons,
  Button,
  Input,
  Modal,
  Badge,
  EmptyState,
  Dropdown,
} from "./ui";

/**
 * CUSTOM METADATA SCHEMA MANAGER
 * Enterprise DAM feature for defining organization-specific metadata fields
 *
 * Features:
 * - Create/edit/delete custom metadata schemas
 * - Support multiple field types (text, number, date, dropdown, multi-select, etc.)
 * - Apply schemas to assets, projects, or collections
 * - Validation rules and required fields
 * - Field grouping for organized display
 */

const client = generateClient<Schema>({ authMode: 'userPool' });

// Field type definitions
const FIELD_TYPES = [
  { value: 'TEXT', label: 'Text', icon: 'FileText' as const, description: 'Single line text input' },
  { value: 'TEXTAREA', label: 'Long Text', icon: 'FileEdit' as const, description: 'Multi-line text area' },
  { value: 'NUMBER', label: 'Number', icon: 'Activity' as const, description: 'Numeric value' },
  { value: 'DATE', label: 'Date', icon: 'Calendar' as const, description: 'Date picker' },
  { value: 'DATETIME', label: 'Date & Time', icon: 'Clock' as const, description: 'Date and time picker' },
  { value: 'DROPDOWN', label: 'Dropdown', icon: 'ChevronDown' as const, description: 'Single selection from list' },
  { value: 'MULTI_SELECT', label: 'Multi-Select', icon: 'CheckSquare' as const, description: 'Multiple selections from list' },
  { value: 'BOOLEAN', label: 'Yes/No', icon: 'Check' as const, description: 'Toggle switch' },
  { value: 'URL', label: 'URL', icon: 'ExternalLink' as const, description: 'Web link' },
  { value: 'EMAIL', label: 'Email', icon: 'Mail' as const, description: 'Email address' },
  { value: 'TIMECODE', label: 'Timecode', icon: 'Film' as const, description: 'SMPTE timecode (HH:MM:SS:FF)' },
  { value: 'USER', label: 'User', icon: 'User' as const, description: 'User reference' },
];

// Entity types that can have custom metadata (matches schema's appliesTo enum)
const ENTITY_TYPES = [
  { value: 'ASSET', label: 'Assets', icon: 'Image' as const },
  { value: 'PROJECT', label: 'Projects', icon: 'Folder' as const },
  { value: 'COLLECTION', label: 'Collections', icon: 'Library' as const },
  { value: 'ALL', label: 'All Types', icon: 'Layers' as const },
];

interface CustomMetadataManagerProps {
  organizationId: string;
  userEmail: string;
  userId: string;
}

interface FieldDefinition {
  id: string;
  name: string;
  fieldType: string;
  description?: string;
  required: boolean;
  options?: string[]; // For dropdown/multi-select
  defaultValue?: string;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  group?: string;
  sortOrder: number;
}

interface SchemaWithFields {
  schema: Schema["CustomMetadataSchema"]["type"];
  fields: FieldDefinition[];
}

export default function CustomMetadataManager({
  organizationId,
  userEmail,
  userId,
}: CustomMetadataManagerProps) {
  // State
  const [schemas, setSchemas] = useState<Schema["CustomMetadataSchema"]["type"][]>([]);
  const [selectedSchema, setSelectedSchema] = useState<SchemaWithFields | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEntityType, setFilterEntityType] = useState<string | null>(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingSchema, setEditingSchema] = useState<Schema["CustomMetadataSchema"]["type"] | null>(null);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);

  // Schema form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAppliesTo, setFormAppliesTo] = useState<'ASSET' | 'PROJECT' | 'COLLECTION' | 'ALL'>('ASSET');

  // Field form state
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');
  const [fieldDescription, setFieldDescription] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [fieldNewOption, setFieldNewOption] = useState('');
  const [fieldDefaultValue, setFieldDefaultValue] = useState('');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldGroup, setFieldGroup] = useState('');

  // Load schemas
  useEffect(() => {
    loadSchemas();
  }, [organizationId, filterEntityType]);

  async function loadSchemas() {
    setIsLoading(true);
    try {
      const filter: Record<string, unknown> = { organizationId: { eq: organizationId } };
      if (filterEntityType) {
        filter.appliesTo = { eq: filterEntityType };
      }

      const { data } = await client.models.CustomMetadataSchema.list({ filter });
      setSchemas(data || []);
    } catch (error) {
      console.error('Error loading schemas:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Load schema with fields
  async function loadSchemaDetails(schemaId: string) {
    try {
      const { data: schema } = await client.models.CustomMetadataSchema.get({ id: schemaId });
      if (!schema) return;

      // Parse fields from JSON
      const fields: FieldDefinition[] = schema.fields ? JSON.parse(schema.fields as string) : [];

      setSelectedSchema({
        schema,
        fields: fields.sort((a, b) => a.sortOrder - b.sortOrder),
      });
    } catch (error) {
      console.error('Error loading schema details:', error);
    }
  }

  // Create schema
  async function handleCreateSchema() {
    if (!formName.trim()) return;

    // Generate slug from name
    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const { data: newSchema } = await client.models.CustomMetadataSchema.create({
        organizationId,
        name: formName,
        slug,
        description: formDescription || undefined,
        appliesTo: formAppliesTo,
        isActive: true,
        fields: JSON.stringify([]),
        createdBy: userId,
        version: 1,
      });

      setShowCreateModal(false);
      resetSchemaForm();
      loadSchemas();

      if (newSchema) {
        loadSchemaDetails(newSchema.id);
      }
    } catch (error) {
      console.error('Error creating schema:', error);
    }
  }

  // Update schema
  async function handleUpdateSchema() {
    if (!editingSchema || !formName.trim()) return;

    try {
      await client.models.CustomMetadataSchema.update({
        id: editingSchema.id,
        name: formName,
        description: formDescription || undefined,
        appliesTo: formAppliesTo,
        lastModifiedBy: userId,
        lastModifiedAt: new Date().toISOString(),
      });

      setEditingSchema(null);
      setShowCreateModal(false);
      resetSchemaForm();
      loadSchemas();

      if (selectedSchema?.schema.id === editingSchema.id) {
        loadSchemaDetails(editingSchema.id);
      }
    } catch (error) {
      console.error('Error updating schema:', error);
    }
  }

  // Delete schema
  async function handleDeleteSchema(schemaId: string) {
    if (!confirm('Are you sure you want to delete this metadata schema? This will not delete existing metadata values.')) {
      return;
    }

    try {
      await client.models.CustomMetadataSchema.delete({ id: schemaId });

      if (selectedSchema?.schema.id === schemaId) {
        setSelectedSchema(null);
      }
      loadSchemas();
    } catch (error) {
      console.error('Error deleting schema:', error);
    }
  }

  // Add/Update field
  async function handleSaveField() {
    if (!selectedSchema || !fieldName.trim()) return;

    try {
      const fields = [...selectedSchema.fields];
      const newField: FieldDefinition = {
        id: editingField?.id || crypto.randomUUID(),
        name: fieldName,
        fieldType: fieldType,
        description: fieldDescription || undefined,
        required: fieldRequired,
        options: ['DROPDOWN', 'MULTI_SELECT'].includes(fieldType) ? fieldOptions : undefined,
        defaultValue: fieldDefaultValue || undefined,
        placeholder: fieldPlaceholder || undefined,
        group: fieldGroup || undefined,
        sortOrder: editingField?.sortOrder ?? fields.length,
      };

      if (editingField) {
        const index = fields.findIndex(f => f.id === editingField.id);
        if (index !== -1) {
          fields[index] = newField;
        }
      } else {
        fields.push(newField);
      }

      await client.models.CustomMetadataSchema.update({
        id: selectedSchema.schema.id,
        fields: JSON.stringify(fields),
        lastModifiedBy: userId,
        lastModifiedAt: new Date().toISOString(),
        version: (selectedSchema.schema.version || 1) + 1,
      });

      setShowFieldModal(false);
      resetFieldForm();
      loadSchemaDetails(selectedSchema.schema.id);
    } catch (error) {
      console.error('Error saving field:', error);
    }
  }

  // Delete field
  async function handleDeleteField(fieldId: string) {
    if (!selectedSchema) return;
    if (!confirm('Are you sure you want to remove this field?')) return;

    try {
      const fields = selectedSchema.fields.filter(f => f.id !== fieldId);

      await client.models.CustomMetadataSchema.update({
        id: selectedSchema.schema.id,
        fields: JSON.stringify(fields),
        lastModifiedBy: userId,
        lastModifiedAt: new Date().toISOString(),
      });

      loadSchemaDetails(selectedSchema.schema.id);
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  }

  // Reorder fields
  async function handleReorderField(fieldId: string, direction: 'up' | 'down') {
    if (!selectedSchema) return;

    const fields = [...selectedSchema.fields];
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    // Swap
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];

    // Update sort orders
    fields.forEach((f, i) => { f.sortOrder = i; });

    try {
      await client.models.CustomMetadataSchema.update({
        id: selectedSchema.schema.id,
        fields: JSON.stringify(fields),
        lastModifiedBy: userId,
        lastModifiedAt: new Date().toISOString(),
      });

      loadSchemaDetails(selectedSchema.schema.id);
    } catch (error) {
      console.error('Error reordering fields:', error);
    }
  }

  function resetSchemaForm() {
    setFormName('');
    setFormDescription('');
    setFormAppliesTo('ASSET');
    setEditingSchema(null);
  }

  function resetFieldForm() {
    setFieldName('');
    setFieldType('TEXT');
    setFieldDescription('');
    setFieldRequired(false);
    setFieldOptions([]);
    setFieldNewOption('');
    setFieldDefaultValue('');
    setFieldPlaceholder('');
    setFieldGroup('');
    setEditingField(null);
  }

  function openEditSchemaModal(schema: Schema["CustomMetadataSchema"]["type"]) {
    setEditingSchema(schema);
    setFormName(schema.name);
    setFormDescription(schema.description || '');
    setFormAppliesTo(schema.appliesTo as typeof formAppliesTo || 'ASSET');
    setShowCreateModal(true);
  }

  function openEditFieldModal(field: FieldDefinition) {
    setEditingField(field);
    setFieldName(field.name);
    setFieldType(field.fieldType);
    setFieldDescription(field.description || '');
    setFieldRequired(field.required);
    setFieldOptions(field.options || []);
    setFieldDefaultValue(field.defaultValue || '');
    setFieldPlaceholder(field.placeholder || '');
    setFieldGroup(field.group || '');
    setShowFieldModal(true);
  }

  function addFieldOption() {
    if (fieldNewOption.trim() && !fieldOptions.includes(fieldNewOption.trim())) {
      setFieldOptions([...fieldOptions, fieldNewOption.trim()]);
      setFieldNewOption('');
    }
  }

  function removeFieldOption(option: string) {
    setFieldOptions(fieldOptions.filter(o => o !== option));
  }

  // Filter schemas
  const filteredSchemas = schemas.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFieldTypeInfo = (type: string) => FIELD_TYPES.find(t => t.value === type);
  const getEntityTypeInfo = (type: string) => ENTITY_TYPES.find(t => t.value === type);

  return (
    <div className="h-full flex flex-col bg-[var(--bg-1)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {selectedSchema ? (
              <>
                <button
                  onClick={() => setSelectedSchema(null)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
                >
                  <Icons.ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {selectedSchema.schema.name}
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    {selectedSchema.fields.length} fields
                  </p>
                </div>
              </>
            ) : (
              <>
                <Icons.Settings className="w-6 h-6 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Custom Metadata Schemas</h2>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedSchema ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditSchemaModal(selectedSchema.schema)}
                >
                  <Icons.Edit className="w-4 h-4 mr-2" />
                  Edit Schema
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    resetFieldForm();
                    setShowFieldModal(true);
                  }}
                >
                  <Icons.Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  resetSchemaForm();
                  setShowCreateModal(true);
                }}
              >
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Schema
              </Button>
            )}
          </div>
        </div>

        {/* Search and filters */}
        {!selectedSchema && (
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search schemas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              />
            </div>

            <div className="flex items-center gap-1 bg-[var(--bg-2)] rounded-lg p-1 border border-[var(--border-default)]">
              <button
                onClick={() => setFilterEntityType(null)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filterEntityType === null
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                }`}
              >
                All
              </button>
              {ENTITY_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setFilterEntityType(type.value)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    filterEntityType === type.value
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : selectedSchema ? (
          // Schema Detail View - Field List
          <div className="space-y-4">
            {selectedSchema.schema.description && (
              <div className="p-4 bg-[var(--bg-2)] rounded-xl border border-[var(--border-default)]">
                <p className="text-[var(--text-secondary)]">{selectedSchema.schema.description}</p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <Badge variant={selectedSchema.schema.isActive ? 'success' : 'default'}>
                    {selectedSchema.schema.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="default">
                    {selectedSchema.schema.appliesTo || 'ASSET'}
                  </Badge>
                  <span className="text-[var(--text-tertiary)]">
                    v{selectedSchema.schema.version || 1}
                  </span>
                </div>
              </div>
            )}

            {selectedSchema.fields.length === 0 ? (
              <EmptyState
                icon="FileEdit"
                title="No fields defined"
                description="Add fields to this schema to start capturing custom metadata"
                action={{
                  label: 'Add Field',
                  onClick: () => {
                    resetFieldForm();
                    setShowFieldModal(true);
                  },
                  icon: 'Plus',
                  variant: 'primary',
                }}
              />
            ) : (
              <div className="space-y-2">
                {selectedSchema.fields.map((field, index) => {
                  const typeInfo = getFieldTypeInfo(field.fieldType);
                  const TypeIcon = typeInfo ? Icons[typeInfo.icon] : Icons.FileText;

                  return (
                    <div
                      key={field.id}
                      className="flex items-center gap-4 p-4 bg-[var(--bg-2)] rounded-xl border border-[var(--border-default)] hover:border-[var(--primary)]/50 transition-colors"
                    >
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleReorderField(field.id, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-[var(--bg-3)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Icons.ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </button>
                        <button
                          onClick={() => handleReorderField(field.id, 'down')}
                          disabled={index === selectedSchema.fields.length - 1}
                          className="p-1 rounded hover:bg-[var(--bg-3)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Icons.ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </button>
                      </div>

                      {/* Field type icon */}
                      <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-[var(--primary)]" />
                      </div>

                      {/* Field info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)]">{field.name}</h3>
                          {field.required && (
                            <Badge variant="warning" size="sm">Required</Badge>
                          )}
                          {field.group && (
                            <Badge variant="default" size="sm">{field.group}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {typeInfo?.label || field.fieldType}
                          {field.description && ` - ${field.description}`}
                        </p>
                        {field.options && field.options.length > 0 && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">
                            Options: {field.options.join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditFieldModal(field)}
                          className="p-2 rounded-lg hover:bg-[var(--bg-3)] transition-colors"
                        >
                          <Icons.Edit className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <Icons.Trash className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : filteredSchemas.length === 0 ? (
          <EmptyState
            icon="Settings"
            title="No metadata schemas"
            description="Create custom metadata schemas to capture additional information about your assets"
            action={{
              label: 'Create Schema',
              onClick: () => {
                resetSchemaForm();
                setShowCreateModal(true);
              },
              icon: 'Plus',
              variant: 'primary',
            }}
          />
        ) : (
          // Schema List
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchemas.map((schema) => {
              const entityInfo = getEntityTypeInfo(schema.appliesTo || 'ASSET');
              const EntityIcon = entityInfo ? Icons[entityInfo.icon] : Icons.Folder;
              const fieldCount = schema.fields ? JSON.parse(schema.fields as string).length : 0;

              return (
                <div
                  key={schema.id}
                  onClick={() => loadSchemaDetails(schema.id)}
                  className="group cursor-pointer bg-[var(--bg-2)] rounded-xl border border-[var(--border-default)] hover:border-[var(--primary)] transition-all p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                      <EntityIcon className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <Dropdown
                      trigger={
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-[var(--bg-3)] transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Icons.MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </button>
                      }
                      items={[
                        { id: 'edit', label: 'Edit Schema', icon: 'Edit', onClick: () => openEditSchemaModal(schema) },
                        { id: 'delete', label: 'Delete Schema', icon: 'Trash', onClick: () => handleDeleteSchema(schema.id), variant: 'danger' },
                      ]}
                    />
                  </div>

                  <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors mb-1">
                    {schema.name}
                  </h3>

                  {schema.description && (
                    <p className="text-sm text-[var(--text-tertiary)] mb-3 line-clamp-2">
                      {schema.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="default" size="sm">
                      {entityInfo?.label || schema.appliesTo}
                    </Badge>
                    <span className="text-[var(--text-tertiary)]">
                      {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Schema Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetSchemaForm();
        }}
        title={editingSchema ? 'Edit Schema' : 'Create Metadata Schema'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Schema Name *
            </label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Video Production Metadata"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Describe what this schema is used for..."
              className="w-full p-3 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Apply To
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ENTITY_TYPES.map(type => {
                const Icon = Icons[type.icon];
                return (
                  <button
                    key={type.value}
                    onClick={() => setFormAppliesTo(type.value as typeof formAppliesTo)}
                    className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${
                      formAppliesTo === type.value
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-[var(--primary)]" />
                    <span className="text-sm text-[var(--text-primary)]">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetSchemaForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={editingSchema ? handleUpdateSchema : handleCreateSchema}
              disabled={!formName.trim()}
            >
              {editingSchema ? 'Save Changes' : 'Create Schema'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Field Modal */}
      <Modal
        isOpen={showFieldModal}
        onClose={() => {
          setShowFieldModal(false);
          resetFieldForm();
        }}
        title={editingField ? 'Edit Field' : 'Add Field'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Field Name *
            </label>
            <Input
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., Camera Model"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Field Type
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {FIELD_TYPES.map(type => {
                const Icon = Icons[type.icon];
                return (
                  <button
                    key={type.value}
                    onClick={() => setFieldType(type.value)}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                      fieldType === type.value
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-xs text-[var(--text-secondary)]">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options for dropdown/multi-select */}
          {['DROPDOWN', 'MULTI_SELECT'].includes(fieldType) && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Options
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={fieldNewOption}
                  onChange={(e) => setFieldNewOption(e.target.value)}
                  placeholder="Add option..."
                  onKeyDown={(e) => e.key === 'Enter' && addFieldOption()}
                />
                <Button variant="secondary" onClick={addFieldOption}>
                  Add
                </Button>
              </div>
              {fieldOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {fieldOptions.map(option => (
                    <Badge key={option} variant="default">
                      {option}
                      <button
                        onClick={() => removeFieldOption(option)}
                        className="ml-1 hover:text-red-500"
                      >
                        <Icons.X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Description
            </label>
            <Input
              value={fieldDescription}
              onChange={(e) => setFieldDescription(e.target.value)}
              placeholder="Help text for users..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Placeholder
              </label>
              <Input
                value={fieldPlaceholder}
                onChange={(e) => setFieldPlaceholder(e.target.value)}
                placeholder="Placeholder text..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Group
              </label>
              <Input
                value={fieldGroup}
                onChange={(e) => setFieldGroup(e.target.value)}
                placeholder="e.g., Technical"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fieldRequired}
                onChange={(e) => setFieldRequired(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-primary)]">Required field</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => {
                setShowFieldModal(false);
                resetFieldForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveField}
              disabled={!fieldName.trim()}
            >
              {editingField ? 'Save Changes' : 'Add Field'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
