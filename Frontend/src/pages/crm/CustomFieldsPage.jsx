import React, { useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
  Hash,
  Calendar,
  ListChecks,
  CheckSquare,
  Lock,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Layers,
  Eye,
  RotateCcw,
} from 'lucide-react';

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'dropdown', label: 'Dropdown', icon: ListChecks },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
];

const TYPE_META = FIELD_TYPES.reduce((acc, item) => ({ ...acc, [item.value]: item }), {});

const PIPELINES = [
  { id: 'commercial', label: 'Commercial Rooftop Pipeline', entity: 'Opportunity' },
  { id: 'residential', label: 'Residential Micro-Inverter Pipeline', entity: 'Opportunity' },
  { id: 'contacts', label: 'Contacts (all pipelines)', entity: 'Contact' },
];

const INITIAL_FIELDS = [
  { id: 'f1', name: 'Property Type', type: 'dropdown', options: ['Commercial', 'Residential', 'Industrial'], required: true, pipelines: ['commercial', 'residential'], recordCount: 1842 },
  { id: 'f2', name: 'Estimated System Size', type: 'number', options: [], required: true, pipelines: ['commercial', 'residential'], recordCount: 1790 },
  { id: 'f3', name: 'Site Inspection Date', type: 'date', options: [], required: false, pipelines: ['commercial'], recordCount: 640 },
  { id: 'f4', name: 'Budget Range', type: 'number', options: [], required: false, pipelines: ['commercial'], recordCount: 512 },
  { id: 'f5', name: 'Preferred Channel', type: 'dropdown', options: ['WhatsApp', 'SMS', 'Email', 'Phone'], required: false, pipelines: ['contacts'], recordCount: 2104 },
  { id: 'f6', name: 'Compliance Review Complete', type: 'checkbox', options: [], required: false, pipelines: ['contacts'], recordCount: 288 },
];

const EMPTY_DRAFT = { name: '', type: 'text', options: [], required: false, pipelines: [] };

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] w-[min(92vw,22rem)]">
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toast.tone === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {toast.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </span>
        <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
      </div>
    </div>
  );
}

function FieldPreview({ draft }) {
  const typeMeta = TYPE_META[draft.type] || TYPE_META.text;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Eye className="h-4 w-4 text-slate-400" /> Live form preview
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          {typeMeta.label}
        </span>
      </div>
      <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
            {draft.name || 'Untitled field'}
            {draft.required && <span className="text-rose-500">*</span>}
          </span>
          {draft.type === 'text' && (
            <input
              disabled
              placeholder="Enter text…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 outline-none"
            />
          )}
          {draft.type === 'number' && (
            <input
              disabled
              placeholder="0"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 outline-none"
            />
          )}
          {draft.type === 'date' && (
            <input
              disabled
              type="date"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 outline-none"
            />
          )}
          {draft.type === 'dropdown' && (
            <div className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">
              {draft.options.length > 0 ? draft.options[0] : 'No options yet'}
            </div>
          )}
          {draft.type === 'checkbox' && (
            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-300 bg-white" />
              Enable
            </span>
          )}
        </label>
        {draft.type === 'dropdown' && draft.options.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {draft.options.map((option) => (
              <span key={option} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                {option}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Layers className="h-3.5 w-3.5" />
        Shown on: {draft.pipelines.length === 0
          ? 'select at least one pipeline'
          : draft.pipelines.map((id) => PIPELINES.find((p) => p.id === id)?.label).join(', ')}
      </p>
    </div>
  );
}

export default function CustomFieldsPage() {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [groupId, setGroupId] = useState('commercial');
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState(null);
  const [optionInput, setOptionInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const pushToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3200);
  };

  const group = PIPELINES.find((p) => p.id === groupId);
  const grouped = useMemo(() => fields.filter((field) => field.pipelines.includes(groupId)), [fields, groupId]);

  function resetForm() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setOptionInput('');
  }

  function startEdit(field) {
    setEditingId(field.id);
    setDraft({ name: field.name, type: field.type, options: [...field.options], required: field.required, pipelines: [...field.pipelines] });
    setOptionInput('');
  }

  function addOption() {
    const value = optionInput.trim();
    if (!value) return;
    if (draft.options.includes(value)) {
      pushToast('That option already exists', 'error');
      return;
    }
    setDraft((prev) => ({ ...prev, options: [...prev.options, value] }));
    setOptionInput('');
  }

  function removeOption(option) {
    setDraft((prev) => ({ ...prev, options: prev.options.filter((o) => o !== option) }));
  }

  function togglePipeline(id) {
    setDraft((prev) => ({
      ...prev,
      pipelines: prev.pipelines.includes(id) ? prev.pipelines.filter((p) => p !== id) : [...prev.pipelines, id],
    }));
  }

  function handleSave(event) {
    event?.preventDefault?.();
    const name = draft.name.trim();
    if (!name) return pushToast('Field name is required', 'error');
    if (draft.pipelines.length === 0) return pushToast('Assign the field to at least one pipeline', 'error');
    if (draft.type === 'dropdown' && draft.options.length === 0) return pushToast('Add at least one dropdown option', 'error');

    if (editingId) {
      setFields((prev) => prev.map((field) => (field.id === editingId ? { ...field, ...draft, name } : field)));
      pushToast('Field updated. Field appears on forms immediately.');
    } else {
      setFields((prev) => [...prev, { id: `f${Date.now()}`, ...draft, name, recordCount: 0 }]);
      pushToast('Field created. Field appears on forms immediately.');
    }
    resetForm();
  }

  function moveField(field, direction) {
    setFields((prev) => {
      const sameGroup = prev.filter((f) => f.pipelines.includes(groupId));
      const index = sameGroup.findIndex((f) => f.id === field.id);
      const swapWith = direction === 'up' ? sameGroup[index - 1] : sameGroup[index + 1];
      if (!swapWith) return prev;
      const a = prev.findIndex((f) => f.id === field.id);
      const b = prev.findIndex((f) => f.id === swapWith.id);
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setFields((prev) => prev.filter((field) => field.id !== deleteTarget.id));
    if (editingId === deleteTarget.id) resetForm();
    pushToast(`Deleted “${deleteTarget.name}” and archived its ${deleteTarget.recordCount.toLocaleString()} stored values`, 'error');
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Custom Fields Manager</h1>
            <p className="text-sm text-slate-500">Define fields once and reuse them across pipelines — no code required (F2.2, F2.3).</p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setDraft((prev) => ({ ...prev, pipelines: [groupId] }));
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New field
          </button>
        </header>

        {/* Pipeline grouping switcher */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {PIPELINES.map((pipeline) => (
            <button
              key={pipeline.id}
              type="button"
              onClick={() => setGroupId(pipeline.id)}
              className={`flex shrink-0 flex-col items-start rounded-lg px-3 py-2 text-left transition ${
                groupId === pipeline.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-semibold">{pipeline.label}</span>
              <span className="text-[11px] text-slate-400">{pipeline.entity} · {fields.filter((f) => f.pipelines.includes(pipeline.id)).length} fields</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Field list */}
          <section className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-800">
                  {group.label} <span className="font-normal text-slate-400">· {group.entity} fields</span>
                </h2>
                <span className="text-xs text-slate-400">Order shown = form order</span>
              </div>

              {grouped.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Layers className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold text-slate-700">No custom fields yet</p>
                  <p className="max-w-sm text-sm text-slate-500">Create your first field to start collecting structured data on {group.entity.toLowerCase()} forms.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {grouped.map((field, index) => {
                    const typeMeta = TYPE_META[field.type];
                    const TypeIcon = typeMeta.icon;
                    return (
                      <li key={field.id} className={`flex items-center gap-3 px-4 py-3 transition ${editingId === field.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/70'}`}>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            aria-label="Move up"
                            disabled={index === 0}
                            onClick={() => moveField(field, 'up')}
                            className="rounded p-0.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Move down"
                            disabled={index === grouped.length - 1}
                            onClick={() => moveField(field, 'down')}
                            className="rounded p-0.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <TypeIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-slate-800">{field.name}</p>
                            {field.required && (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
                                <Lock className="h-2.5 w-2.5" /> required
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[11px] text-slate-400">
                            {typeMeta.label}
                            {field.type === 'dropdown' && field.options.length > 0 ? ` · ${field.options.join(', ')}` : ''}
                            {' · '}{field.recordCount.toLocaleString()} stored values
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(field)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(field)}
                            aria-label={`Delete ${field.name}`}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Editor + preview */}
          <section className="space-y-5 lg:col-span-2">
            <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Edit field' : 'Create field'}</h2>
                {editingId && (
                  <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-slate-600">
                    <X className="h-3 w-3" /> Cancel edit
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Field name</span>
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="e.g. Property Type"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <div>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Field type</span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {FIELD_TYPES.map((type) => {
                      const Icon = type.icon;
                      const active = draft.type === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, type: type.value, options: type.value === 'dropdown' ? prev.options : [] }))}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
                            active ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {draft.type === 'dropdown' && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                    <span className="mb-1.5 block text-xs font-medium text-slate-500">Dropdown options</span>
                    <div className="flex gap-2">
                      <input
                        value={optionInput}
                        onChange={(event) => setOptionInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addOption();
                          }
                        }}
                        placeholder="Add option…"
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                      <button type="button" onClick={addOption} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                    {draft.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {draft.options.map((option) => (
                          <span key={option} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                            {option}
                            <button type="button" aria-label={`Remove ${option}`} onClick={() => removeOption(option)} className="text-slate-300 transition hover:text-rose-500">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, required: !prev.required }))}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:bg-slate-50"
                >
                  <span className="text-xs font-medium text-slate-600">Required field</span>
                  <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${draft.required ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <span className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-all ${draft.required ? 'left-[19px]' : 'left-0.5'}`} />
                  </span>
                </button>

                <div>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Apply to pipelines</span>
                  <div className="space-y-1.5">
                    {PIPELINES.map((pipeline) => {
                      const checked = draft.pipelines.includes(pipeline.id);
                      return (
                        <button
                          key={pipeline.id}
                          type="button"
                          onClick={() => togglePipeline(pipeline.id)}
                          className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition ${
                            checked ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                            {checked && <CheckCircle2 className="h-3 w-3" />}
                          </span>
                          <span className="text-xs font-medium text-slate-700">{pipeline.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={resetForm} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                  <Save className="h-4 w-4" /> {editingId ? 'Save changes' : 'Create field'}
                </button>
              </div>
            </form>

            <FieldPreview draft={draft} />
          </section>
        </div>
      </div>

      {/* Delete warning */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Delete “{deleteTarget.name}”?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  This field currently stores <span className="font-semibold text-slate-700">{deleteTarget.recordCount.toLocaleString()} values</span> across
                  {' '}{deleteTarget.pipelines.length} pipeline{deleteTarget.pipelines.length === 1 ? '' : 's'}. Deleting it removes the field and archives its
                  data — this cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Keep field
              </button>
              <button type="button" onClick={confirmDelete} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700">
                <Trash2 className="h-4 w-4" /> Delete field
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
