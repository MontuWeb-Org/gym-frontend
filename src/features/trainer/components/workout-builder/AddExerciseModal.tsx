import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LibraryExercise } from "../../types/workout-builder.types";

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredLibrary: LibraryExercise[];
  assignedExerciseIds: number[];
  selectedExerciseIds: number[];
  toggleSelectExercise: (id: number) => void;
  handleAddSelectedExercises: () => void;
}

export function AddExerciseModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredLibrary,
  assignedExerciseIds,
  selectedExerciseIds,
  toggleSelectExercise,
  handleAddSelectedExercises,
}: AddExerciseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold">Exercise Library</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div>
          <Input 
            placeholder="Search exercises by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {filteredLibrary.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">No exercises found.</p>
          ) : (
            filteredLibrary.map((libEx) => {
              const isAlreadyAdded = assignedExerciseIds.includes(libEx.id);
              const isSelected = selectedExerciseIds.includes(libEx.id);

              return (
                <div 
                  key={libEx.id} 
                  onClick={() => !isAlreadyAdded && toggleSelectExercise(libEx.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isAlreadyAdded ? "opacity-50 bg-muted/20 cursor-not-allowed" :
                    isSelected ? "border-primary bg-primary/10 cursor-pointer" : "hover:bg-muted/50 cursor-pointer"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{libEx.name}</h5>
                      {isAlreadyAdded && <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">Added</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{libEx.difficulty} &bull; {libEx.equipment?.join(", ")}</p>
                  </div>
                  {!isAlreadyAdded && (
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => {}} 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            {selectedExerciseIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleAddSelectedExercises} disabled={selectedExerciseIds.length === 0}>
              Add Selected
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}