import type { Wizard, Spell, NewWizard } from "./types";
import { Log, MeasureTime, ValidateSpellPower } from "./decorators";

export class Repository<T extends { id: number }> {
  private items: T[] = [];

  @Log
  add(item: T): void {
    this.items.push(item);
  }

  @MeasureTime
  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  update(id: number, changes: Partial<T>): boolean {
    const item = this.findById(id);

    if (!item) return false;

    Object.assign(item, changes);
    return true;
  }
}

export class WizardRepository extends Repository<Wizard> {
  // Exercice 1 : le repository attribue l'identifiant
  create(data: NewWizard): Wizard {
    const nextId =
      this.getAll().reduce((max, wizard) => Math.max(max, wizard.id), 0) + 1;

    const wizard: Wizard = { ...data, id: nextId } as Wizard;
    this.add(wizard);
    return wizard;
  }

  // Exercice 2 : Wizard["house"] = type à accès indexé (= House)
  findByHouse(house: Wizard["house"]): Wizard[] {
    return this.getAll().filter(wizard => wizard.house === house);
  }
}

export class SpellRepository extends Repository<Spell> {
  // Exercice 4 : on refuse les sorts avec une puissance négative
  @ValidateSpellPower
  override add(spell: Spell): void {
    super.add(spell);
  }
}
