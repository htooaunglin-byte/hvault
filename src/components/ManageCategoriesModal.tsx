import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ChevronsUp, 
  RotateCcw, 
  FolderPlus, 
  Layers, 
  Check, 
  AlertTriangle,
  GripVertical,
  Lock,
  Key,
  KeyRound,
  CreditCard,
  Shield,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_CATEGORY_FLOWS, 
  CategoryFlowType, 
  CATEGORY_FLOW_OPTIONS 
} from '../types';
import { getCategoryVisual, getCategoryIconComponent, getCategoryFlow } from '../lib/categoryUtils';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  categoryFlows?: Record<string, CategoryFlowType>;
  onSaveCategories: (newCategories: string[], updatedFlows?: Record<string, CategoryFlowType>) => Promise<void>;
  categoryCounts: Record<string, number>;
  onDeleteCategoryWithReassign?: (categoryToDelete: string) => Promise<void>;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  categoryFlows = DEFAULT_CATEGORY_FLOWS,
  onSaveCategories,
  categoryCounts,
  onDeleteCategoryWithReassign,
}) => {
  const [currentCategories, setCurrentCategories] = useState<string[]>(categories);
  const [currentFlows, setCurrentFlows] = useState<Record<string, CategoryFlowType>>(categoryFlows);
  const [newCatInput, setNewCatInput] = useState('');
  const [selectedFlowForNew, setSelectedFlowForNew] = useState<CategoryFlowType>('password');
  const [inputError, setInputError] = useState('');
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingFlowCategory, setEditingFlowCategory] = useState<string | null>(null);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const deleteConfirmRef = React.useRef<HTMLDivElement>(null);
  const touchStartYRef = React.useRef<number | null>(null);
  const touchCurrentIdxRef = React.useRef<number | null>(null);

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setCurrentCategories(categories);
      setCurrentFlows(categoryFlows);
      setNewCatInput('');
      setSelectedFlowForNew('password');
      setInputError('');
      setPendingDeleteCategory(null);
      setDraggedIndex(null);
      setDragOverIndex(null);
      setEditingFlowCategory(null);
    }
  }, [isOpen, categories, categoryFlows]);

  // Smoothly scroll back up to the delete confirmation card when a category delete is requested
  React.useEffect(() => {
    if (pendingDeleteCategory) {
      const timer = setTimeout(() => {
        if (deleteConfirmRef.current) {
          deleteConfirmRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [pendingDeleteCategory]);

  if (!isOpen) return null;

  const handleRequestDelete = (cat: string) => {
    setPendingDeleteCategory(cat);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) {
      setInputError('Please enter a category name.');
      return;
    }
    if (trimmed.length > 30) {
      setInputError('Category name must be under 30 characters.');
      return;
    }
    if (currentCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('A category with this name already exists.');
      return;
    }

    const updated = [...currentCategories, trimmed];
    const updatedFlows = {
      ...currentFlows,
      [trimmed]: selectedFlowForNew,
    };

    setCurrentCategories(updated);
    setCurrentFlows(updatedFlows);
    setNewCatInput('');
    setSelectedFlowForNew('password');
    setInputError('');

    try {
      setIsSaving(true);
      await onSaveCategories(updated, updatedFlows);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeCategoryFlow = async (cat: string, newFlow: CategoryFlowType) => {
    const updatedFlows = {
      ...currentFlows,
      [cat]: newFlow,
    };
    setCurrentFlows(updatedFlows);
    setEditingFlowCategory(null);

    try {
      setIsSaving(true);
      await onSaveCategories(currentCategories, updatedFlows);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down' | 'top') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentCategories.length - 1) return;

    const list = [...currentCategories];
    const item = list[index];

    if (direction === 'top') {
      list.splice(index, 1);
      list.unshift(item);
    } else if (direction === 'up') {
      const targetIndex = index - 1;
      list[index] = list[targetIndex];
      list[targetIndex] = item;
    } else {
      const targetIndex = index + 1;
      list[index] = list[targetIndex];
      list[targetIndex] = item;
    }

    setCurrentCategories(list);

    try {
      setIsSaving(true);
      await onSaveCategories(list, currentFlows);
    } finally {
      setIsSaving(false);
    }
  };

  // Drag and Drop handlers (HTML5 + Pointer)
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIdxStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = sourceIdxStr !== '' ? Number(sourceIdxStr) : draggedIndex;

    setDraggedIndex(null);
    setDragOverIndex(null);

    if (sourceIndex === null || sourceIndex === undefined || isNaN(sourceIndex) || sourceIndex === targetIndex) {
      return;
    }

    if (sourceIndex < 0 || sourceIndex >= currentCategories.length || targetIndex < 0 || targetIndex >= currentCategories.length) {
      return;
    }

    const updated = [...currentCategories];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setCurrentCategories(updated);

    try {
      setIsSaving(true);
      await onSaveCategories(updated, currentFlows);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch handlers for mobile drag & drop
  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchCurrentIdxRef.current = index;
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null || touchCurrentIdxRef.current === null) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el) {
      const cardEl = el.closest('[data-category-idx]');
      if (cardEl) {
        const idx = Number(cardEl.getAttribute('data-category-idx'));
        if (!isNaN(idx) && idx !== dragOverIndex && idx >= 0 && idx < currentCategories.length) {
          setDragOverIndex(idx);
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const sourceIndex = draggedIndex;
      const targetIndex = dragOverIndex;
      const updated = [...currentCategories];
      const [movedItem] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, movedItem);

      setCurrentCategories(updated);
      setDraggedIndex(null);
      setDragOverIndex(null);
      touchStartYRef.current = null;
      touchCurrentIdxRef.current = null;

      try {
        setIsSaving(true);
        await onSaveCategories(updated, currentFlows);
      } finally {
        setIsSaving(false);
      }
    } else {
      setDraggedIndex(null);
      setDragOverIndex(null);
      touchStartYRef.current = null;
      touchCurrentIdxRef.current = null;
    }
  };

  const confirmDeleteCategory = async (categoryToDelete: string) => {
    if (currentCategories.length <= 1) {
      setInputError('You must keep at least one category.');
      setPendingDeleteCategory(null);
      return;
    }

    try {
      setIsSaving(true);
      if (onDeleteCategoryWithReassign) {
        await onDeleteCategoryWithReassign(categoryToDelete);
      }
      const updated = currentCategories.filter((c) => c !== categoryToDelete);
      const updatedFlows = { ...currentFlows };
      delete updatedFlows[categoryToDelete];

      setCurrentCategories(updated);
      setCurrentFlows(updatedFlows);
      await onSaveCategories(updated, updatedFlows);
      setPendingDeleteCategory(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    setCurrentCategories(DEFAULT_CATEGORIES);
    setCurrentFlows(DEFAULT_CATEGORY_FLOWS);
    try {
      setIsSaving(true);
      await onSaveCategories(DEFAULT_CATEGORIES, DEFAULT_CATEGORY_FLOWS);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="w-full max-w-2xl bg-[#0D1425] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-400/30 text-sky-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                Organize Categories & Creation Flows
              </h2>
              <p className="text-[11px] text-white/50 font-bold">
                Configure custom categories and choose whether password creation behaves like Passwords, API Keys, OAuth, ATM Cards, or Safes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div ref={scrollContainerRef} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* Add Category Section with Flow Selector */}
          <div className="p-4 bg-slate-900/90 border border-white/10 rounded-2xl space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Create New Category</span>
              </label>
              <span className="text-[10px] font-bold text-white/40">
                Choose template flow for items
              </span>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => {
                    setNewCatInput(e.target.value);
                    if (inputError) setInputError('');
                  }}
                  placeholder="Category Name (e.g. AI Services, Database Keys, Crypto, Corporate Cards...)"
                  maxLength={30}
                  className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-sky-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newCatInput.trim() || isSaving}
                  className="px-4 sm:px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-sky-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </div>

              {/* Flow Archetype Selection Options */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Select Password Creation Flow:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {CATEGORY_FLOW_OPTIONS.map((opt) => {
                    const isSelected = selectedFlowForNew === opt.id;
                    const IconComp = opt.id === 'password'
                      ? Lock
                      : opt.id === 'api_key'
                      ? Key
                      : opt.id === 'oauth'
                      ? KeyRound
                      : opt.id === 'atm_card'
                      ? CreditCard
                      : Shield;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedFlowForNew(opt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative overflow-hidden ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-400 text-white ring-1 ring-sky-400 shadow-md shadow-sky-950/50'
                            : 'bg-slate-950/60 border-white/10 text-white/70 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`p-1.5 rounded-lg ${
                            isSelected ? 'bg-sky-500 text-white' : 'bg-white/5 text-white/60'
                          }`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[11px] font-black leading-tight truncate">
                            {opt.shortLabel}
                          </div>
                          <div className="text-[9px] text-white/40 line-clamp-2 leading-tight mt-0.5">
                            {opt.id === 'password' && 'Username & Password'}
                            {opt.id === 'api_key' && 'Encrypted API Token'}
                            {opt.id === 'oauth' && 'Client ID & Secret'}
                            {opt.id === 'atm_card' && 'Card No. & ATM PIN'}
                            {opt.id === 'safes' && 'Vault Combination'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            {inputError && (
              <p className="text-xs text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{inputError}</span>
              </p>
            )}
          </div>

          {/* Reordering Instructions Banner */}
          <div className="p-3 bg-sky-950/40 border border-sky-500/20 rounded-xl flex items-start gap-2.5 text-xs text-sky-300">
            <span className="text-base">💡</span>
            <p className="text-[11px] text-sky-200/80 leading-relaxed">
              <span className="font-bold text-white">Flow Archetypes</span> determine the layout when adding credentials under that category. Click any category&apos;s <span className="font-bold text-white">Flow Badge</span> below to change its creation behavior anytime.
            </p>
          </div>

          {/* Delete Confirmation Warning Box */}
          <AnimatePresence>
            {pendingDeleteCategory && (
              <motion.div
                ref={deleteConfirmRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2 text-rose-300 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Delete &quot;{pendingDeleteCategory}&quot; Category?</span>
                </div>
                <p className="text-[11px] text-rose-300/80 leading-relaxed">
                  {categoryCounts[pendingDeleteCategory] > 0
                    ? `This category contains ${categoryCounts[pendingDeleteCategory]} password item(s). Deleting will automatically reassign them to "General" so no data is lost.`
                    : 'Are you sure you want to remove this category from your list?'}
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteCategory(null)}
                    className="px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDeleteCategory(pendingDeleteCategory)}
                    className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-widest text-white/40">
              <span>Categories ({currentCategories.length}) — Drag to Reorder</span>
              <span>Creation Flow / Actions</span>
            </div>

            <div className="space-y-2">
              {currentCategories.map((cat, idx) => {
                const count = categoryCounts[cat] || 0;
                const isFirst = idx === 0;
                const isLast = idx === currentCategories.length - 1;
                const isBeingDragged = draggedIndex === idx;
                const isDragOverThis = dragOverIndex === idx && draggedIndex !== idx;
                const flow = getCategoryFlow(cat, currentFlows);
                const isEditingThisFlow = editingFlowCategory === cat;

                const flowMeta = CATEGORY_FLOW_OPTIONS.find((f) => f.id === flow) || CATEGORY_FLOW_OPTIONS[0];
                const IconComp = getCategoryIconComponent(cat, currentFlows);

                return (
                  <motion.div
                    key={cat}
                    data-category-idx={idx}
                    layout
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    draggable={!isSaving}
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, idx)}
                    onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent<HTMLDivElement>, idx)}
                    onDragEnter={(e) => handleDragOver(e as unknown as React.DragEvent<HTMLDivElement>, idx)}
                    onDragLeave={(e) => handleDragLeave(e as unknown as React.DragEvent<HTMLDivElement>, idx)}
                    onDrop={(e) => handleDrop(e as unknown as React.DragEvent<HTMLDivElement>, idx)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 rounded-2xl gap-2 transition-all group flex flex-col sm:flex-row sm:items-center justify-between ${
                      isBeingDragged
                        ? 'opacity-40 border-2 border-sky-400 bg-sky-950/60 scale-[0.98] shadow-xl'
                        : isDragOverThis
                        ? 'border-2 border-sky-400 bg-sky-900/40 ring-2 ring-sky-400/40 scale-[1.01] shadow-lg'
                        : 'bg-slate-900/70 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Left: Drag Handle, Position & Category Badge */}
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                      {/* Drag Grip Handle */}
                      <div
                        title="Drag to reorder"
                        onTouchStart={(e) => handleTouchStart(idx, e)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-white/30 group-hover:text-sky-400 hover:bg-white/5 rounded transition-colors shrink-0 flex items-center justify-center"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <span className="text-[10px] font-mono font-bold text-white/30 w-3.5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-lg bg-white/5 text-white/80 shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                          {cat}
                        </span>
                        <span className="text-[10px] font-medium text-white/40 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                          {count} {count === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Interactive Flow Archetype Pill & Reorder Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      {/* Flow Archetype Pill / Dropdown Toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setEditingFlowCategory(isEditingThisFlow ? null : cat)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer ${flowMeta.badgeClass} hover:opacity-90`}
                          title="Click to switch password creation flow for this category"
                        >
                          <span>Flow: {flowMeta.shortLabel}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${isEditingThisFlow ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Flow Dropdown Menu */}
                        <AnimatePresence>
                          {isEditingThisFlow && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              className="absolute right-0 sm:right-0 mt-1.5 w-52 bg-[#0a0f1d] border border-white/20 rounded-xl shadow-2xl p-1.5 z-30 space-y-1"
                            >
                              <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/40 border-b border-white/10">
                                Switch Flow for &quot;{cat}&quot;
                              </div>
                              {CATEGORY_FLOW_OPTIONS.map((f) => {
                                const isCurrent = flow === f.id;
                                const FlowIcon = f.id === 'password'
                                  ? Lock
                                  : f.id === 'api_key'
                                  ? Key
                                  : f.id === 'oauth'
                                  ? KeyRound
                                  : f.id === 'atm_card'
                                  ? CreditCard
                                  : Shield;

                                return (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => handleChangeCategoryFlow(cat, f.id)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                      isCurrent
                                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <FlowIcon className="w-3.5 h-3.5 text-white/60" />
                                      <span>{f.label}</span>
                                    </div>
                                    {isCurrent && <Check className="w-3.5 h-3.5 text-sky-400" />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-0.5">
                        {/* Move to Top */}
                        {!isFirst && (
                          <button
                            type="button"
                            onClick={() => handleMoveCategory(idx, 'top')}
                            title={`Move ${cat} to Top`}
                            className="p-1.5 text-sky-400 hover:text-white hover:bg-sky-500/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <ChevronsUp className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveCategory(idx, 'up')}
                          title="Move Up"
                          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveCategory(idx, 'down')}
                          title="Move Down"
                          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleRequestDelete(cat)}
                          title={`Delete ${cat}`}
                          className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 text-[11px] font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-950/50 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

