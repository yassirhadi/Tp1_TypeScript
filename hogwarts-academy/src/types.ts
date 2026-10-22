export type House =
  | "Gryffindor"
  | "Slytherin"
  | "Ravenclaw"
  | "Hufflepuff";

// Propriétés connues d'un sorcier (sans index signature)
export interface WizardCore {
  id: number;
  name: string;
  house: House;
  level: number;
  active: boolean;
}

export interface Wizard extends WizardCore {
  // Index signature: dynamic properties must use these value types.
  [key: string]: string | number | boolean;
}

export type SpellCategory = "attack" | "defense" | "healing";

export interface Spell {
  id: number;
  name: string;
  category: SpellCategory;
  power: number;
}

export type AcademyEvent =
  | { type: "spell-cast"; wizardId: number; spellName: string }
  | { type: "level-up"; wizardId: number; newLevel: number }
  | { type: "wizard-expelled"; wizardId: number };

// Conditional type: choose an output type based on the spell category.
export type SpellOutput<T extends SpellCategory> =
  T extends "attack" ? number :
  T extends "defense" ? boolean :
  T extends "healing" ? string :
  never;

// infer extracts an array element type.
export type ArrayElement<T> =
  T extends (infer Item)[] ? Item : never;

// Utility type examples.
// NB: Omit<Wizard, "id"> directement sur Wizard perdrait les propriétés connues
// à cause de l'index signature. On omet donc "id" sur WizardCore,
// puis on re-autorise les propriétés dynamiques (ex: patronus).
export type NewWizard = Omit<WizardCore, "id"> & {
  [key: string]: string | number | boolean;
};
export type WizardSummary = Pick<Wizard, "id" | "name" | "house">;
export type WizardUpdate = Partial<Wizard>;

export type AttackSpell = Extract<Spell, { category: "attack" }>;
export type NonHealingCategory = Exclude<SpellCategory, "healing">;
export type HousePoints = Record<House, number>;

// ---- Exercice 3 : Extract pour isoler l'événement "spell-cast" ----
export type SpellCastEvent = Extract<AcademyEvent, { type: "spell-cast" }>;
