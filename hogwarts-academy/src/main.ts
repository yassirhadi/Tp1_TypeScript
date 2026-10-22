import {
  type Wizard,
  type Spell,
  type AcademyEvent,
  type House,
  type HousePoints,
  type SpellCategory,
  type SpellOutput,
  type ArrayElement,
  type WizardSummary,
  type WizardUpdate,
  type AttackSpell,
  type NonHealingCategory,
  type SpellCastEvent,
} from "./types";

import { WizardRepository, SpellRepository } from "./repository";
import { Log, Cache } from "./decorators";

// ---------- Exercice 6 : Type Guards stricts ----------
const validHouses: readonly House[] = [
  "Gryffindor",
  "Slytherin",
  "Ravenclaw",
  "Hufflepuff",
];

function isHouse(value: unknown): value is House {
  return (
    typeof value === "string" &&
    validHouses.some(house => house === value)
  );
}

function isWizard(value: unknown): value is Wizard {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    isHouse(candidate.house) &&
    typeof candidate.level === "number" &&
    typeof candidate.active === "boolean"
  );
}

// ---------- Exercice 3 : handler qui n'accepte que "spell-cast" ----------
function handleSpellCast(event: SpellCastEvent): void {
  console.log(`Wizard ${event.wizardId} cast ${event.spellName}`);
}

// ---------- Service principal ----------
class AcademyService {
  constructor(
    private readonly wizards: WizardRepository,
    private readonly spells: SpellRepository
  ) {}

  @Log
  castSpell(wizardId: number, spellId: number): string {
    const wizard = this.wizards.findById(wizardId);
    const spell = this.spells.findById(spellId);

    if (!wizard || !spell) {
      throw new Error("Wizard or spell not found");
    }

    return `${wizard.name} casts ${spell.name}!`;
  }

  findByHouse(house: House): WizardSummary[] {
    return this.wizards
      .getAll()
      .filter(wizard => wizard.house === house)
      .map(({ id, name, house }) => ({ id, name, house }));
  }

  updateWizard(id: number, changes: WizardUpdate): boolean {
    return this.wizards.update(id, changes);
  }

  getSpellEvents(events: AcademyEvent[]): SpellCastEvent[] {
    return events.filter(
      (event): event is SpellCastEvent => event.type === "spell-cast"
    );
  }
}

// ---------- Exercice 5 : service avec cache ----------
class SpellCalculator {
  @Cache
  calculatePower(basePower: number, multiplier: number): number {
    console.log("Calculating...");
    return basePower * multiplier;
  }
}

// ---------- Données de départ ----------
const wizards = new WizardRepository();
const spells = new SpellRepository();

wizards.add({
  id: 1,
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true,
  patronus: "Stag",
});

wizards.add({
  id: 2,
  name: "Hermione Granger",
  house: "Gryffindor",
  level: 8,
  active: true,
});

wizards.add({
  id: 3,
  name: "Draco Malfoy",
  house: "Slytherin",
  level: 6,
  active: true,
});

spells.add({ id: 101, name: "Expelliarmus", category: "attack", power: 80 });
spells.add({ id: 102, name: "Protego", category: "defense", power: 60 });

const academy = new AcademyService(wizards, spells);

console.log("\n--- Cast a spell ---");
console.log(academy.castSpell(1, 101));

console.log("\n--- Find wizards by house (service) ---");
console.log(academy.findByHouse("Gryffindor"));

console.log("\n--- Update a wizard ---");
academy.updateWizard(1, { level: 6 });
console.log(wizards.findById(1));

console.log("\n--- Type guard ---");
const unknownWizard: unknown = wizards.findById(1);
if (isWizard(unknownWizard)) {
  console.log(`${unknownWizard.name} belongs to ${unknownWizard.house}`);
}

console.log("\n--- Record utility type ---");
const points: HousePoints = {
  Gryffindor: 100,
  Slytherin: 80,
  Ravenclaw: 90,
  Hufflepuff: 70,
};
console.log(points);

console.log("\n--- Extract spell-cast events ---");
const events: AcademyEvent[] = [
  { type: "spell-cast", wizardId: 1, spellName: "Lumos" },
  { type: "level-up", wizardId: 2, newLevel: 9 },
  { type: "wizard-expelled", wizardId: 3 },
];
console.log(academy.getSpellEvents(events));

// =====================  TESTS DU TAF  =====================

console.log("\n=== Exercice 1 : ajouter un sorcier (sans id) ===");
const luna = wizards.create({
  name: "Luna Lovegood",
  house: "Ravenclaw",
  level: 4,
  active: true,
});
console.log("Nouveau sorcier :", luna); // id attribué automatiquement (4)

console.log("\n=== Exercice 2 : filtrer par maison (repository) ===");
console.log(wizards.findByHouse("Gryffindor").map(w => w.name));
console.log(wizards.findByHouse("Ravenclaw").map(w => w.name));
// wizards.findByHouse("Durmstrang"); // ❌ erreur de compilation

console.log("\n=== Exercice 3 : handler Extract ===");
handleSpellCast({
  type: "spell-cast",
  wizardId: 1,
  spellName: "Expelliarmus",
});
// handleSpellCast({ type: "level-up", wizardId: 1, newLevel: 2 }); // ❌ erreur

console.log("\n=== Exercice 4 : valider la puissance ===");
spells.add({ id: 103, name: "Stupefy", category: "attack", power: 50 }); // ✅
try {
  spells.add({ id: 104, name: "Invalid Spell", category: "attack", power: -10 });
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log("Sort refusé :", error.message);
  }
}
console.log("Nombre de sorts :", spells.getAll().length); // 3 (le sort invalide n'est pas ajouté)

console.log("\n=== Exercice 5 : méthode avec cache ===");
const calculator = new SpellCalculator();
console.log(calculator.calculatePower(10, 3)); // MISS
console.log(calculator.calculatePower(10, 3)); // HIT
console.log(calculator.calculatePower(5, 2));  // MISS

console.log("\n=== Exercice 6 : type guard strict ===");
const validData: unknown = {
  id: 1,
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true,
};
const invalidData: unknown = {
  id: 2,
  name: "Viktor",
  house: "Durmstrang",
  level: 5,
  active: true,
};
console.log(isWizard(validData));   // true
console.log(isWizard(invalidData)); // false

// ---------- Compile-time demonstrations ----------
type CastArguments = Parameters<AcademyService["castSpell"]>;
type CastResult = ReturnType<AcademyService["castSpell"]>;
type AttackOutput = SpellOutput<"attack">; // number
type HealingOutput = SpellOutput<"healing">; // string
type SpellItem = ArrayElement<Spell[]>; // Spell
type AttackSpellExample = AttackSpell;
type RemainingCategories = NonHealingCategory;
type CategoryExample = SpellCategory;

const typeExamples: [
  CastArguments,
  CastResult,
  AttackOutput,
  HealingOutput,
  SpellItem,
  AttackSpellExample["category"],
  RemainingCategories,
  CategoryExample
] | null = null;

void typeExamples;
