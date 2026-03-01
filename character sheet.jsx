import { useState, useEffect, useCallback } from "react";

// ============================================================
// EMBEDDED JSON DATA
// ============================================================

const RACES_DATA = [
  { name: "Dwarf", asi: { Constitution: 2 }, speed: 25, size: "Medium", traits: ["Darkvision","Dwarven Resilience","Dwarven Combat Training","Tool Proficiency","Stonecunning"], languages: ["Common","Dwarvish"], subraces: [{ name: "Hill Dwarf", asi: { Wisdom: 1 }, traits: ["Dwarven Toughness"] }, { name: "Mountain Dwarf", asi: { Strength: 2 }, traits: ["Dwarven Armor Training"] }] },
  { name: "Elf", asi: { Dexterity: 2 }, speed: 30, size: "Medium", traits: ["Darkvision","Keen Senses","Fey Ancestry","Trance"], languages: ["Common","Elvish"], subraces: [{ name: "High Elf", asi: { Intelligence: 1 }, traits: ["Elf Weapon Training","Cantrip","Extra Language"] }, { name: "Wood Elf", asi: { Wisdom: 1 }, traits: ["Elf Weapon Training","Fleet of Foot","Mask of the Wild"] }, { name: "Dark Elf (Drow)", asi: { Charisma: 1 }, traits: ["Superior Darkvision","Sunlight Sensitivity","Drow Magic","Drow Weapon Training"] }] },
  { name: "Halfling", asi: { Dexterity: 2 }, speed: 25, size: "Small", traits: ["Lucky","Brave","Halfling Nimbleness"], languages: ["Common","Halfling"], subraces: [{ name: "Lightfoot", asi: { Charisma: 1 }, traits: ["Naturally Stealthy"] }, { name: "Stout", asi: { Constitution: 1 }, traits: ["Stout Resilience"] }] },
  { name: "Human", asi: { Strength: 1, Dexterity: 1, Constitution: 1, Intelligence: 1, Wisdom: 1, Charisma: 1 }, speed: 30, size: "Medium", traits: [], languages: ["Common","One extra language of your choice"], subraces: [{ name: "Variant Human", asi: {}, traits: ["Skill Proficiency (1)","Feat (1)"] }] },
  { name: "Dragonborn", asi: { Strength: 2, Charisma: 1 }, speed: 30, size: "Medium", traits: ["Draconic Ancestry","Breath Weapon","Damage Resistance"], languages: ["Common","Draconic"], subraces: [] },
  { name: "Gnome", asi: { Intelligence: 2 }, speed: 25, size: "Small", traits: ["Darkvision","Gnome Cunning"], languages: ["Common","Gnomish"], subraces: [{ name: "Forest Gnome", asi: { Dexterity: 1 }, traits: ["Natural Illusionist","Speak with Small Beasts"] }, { name: "Rock Gnome", asi: { Constitution: 1 }, traits: ["Artificer's Lore","Tinker"] }] },
  { name: "Half-Elf", asi: { Charisma: 2 }, speed: 30, size: "Medium", traits: ["Darkvision","Fey Ancestry","Skill Versatility (+2 skills)"], languages: ["Common","Elvish","One extra language"], subraces: [] },
  { name: "Half-Orc", asi: { Strength: 2, Constitution: 1 }, speed: 30, size: "Medium", traits: ["Darkvision","Menacing","Relentless Endurance","Savage Attacks"], languages: ["Common","Orc"], subraces: [] },
  { name: "Tiefling", asi: { Charisma: 2, Intelligence: 1 }, speed: 30, size: "Medium", traits: ["Darkvision","Hellish Resistance","Infernal Legacy"], languages: ["Common","Infernal"], subraces: [] },
];

const CLASSES_DATA = [
  { name: "Barbarian", hitDie: "1d12", primaryAbility: ["Strength"], savingThrows: ["Strength","Constitution"], spellcasting: null, armorProf: ["Light armor","Medium armor","Shields"], weaponProf: ["Simple weapons","Martial weapons"], skillChoices: 2, skillList: ["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"], features: [{level:1,name:"Rage"},{level:1,name:"Unarmored Defense"},{level:2,name:"Reckless Attack"},{level:2,name:"Danger Sense"},{level:3,name:"Primal Path"},{level:4,name:"ASI"},{level:5,name:"Extra Attack"},{level:5,name:"Fast Movement"},{level:7,name:"Feral Instinct"},{level:9,name:"Brutal Critical"},{level:11,name:"Relentless Rage"},{level:15,name:"Persistent Rage"},{level:18,name:"Indomitable Might"},{level:20,name:"Primal Champion"}] },
  { name: "Bard", hitDie: "1d8", primaryAbility: ["Charisma"], savingThrows: ["Dexterity","Charisma"], spellcasting: "Charisma", armorProf: ["Light armor"], weaponProf: ["Simple weapons","Hand crossbows","Longswords","Rapiers","Shortswords"], skillChoices: 3, skillList: ["Any"], features: [{level:1,name:"Spellcasting"},{level:1,name:"Bardic Inspiration"},{level:2,name:"Jack of All Trades"},{level:2,name:"Song of Rest"},{level:3,name:"Bard College"},{level:3,name:"Expertise"},{level:4,name:"ASI"},{level:5,name:"Font of Inspiration"},{level:6,name:"Countercharm"},{level:10,name:"Magical Secrets"},{level:20,name:"Superior Inspiration"}] },
  { name: "Cleric", hitDie: "1d8", primaryAbility: ["Wisdom"], savingThrows: ["Wisdom","Charisma"], spellcasting: "Wisdom", armorProf: ["Light armor","Medium armor","Shields"], weaponProf: ["Simple weapons"], skillChoices: 2, skillList: ["History","Insight","Medicine","Persuasion","Religion"], features: [{level:1,name:"Spellcasting"},{level:1,name:"Divine Domain"},{level:2,name:"Channel Divinity"},{level:2,name:"Channel Divinity: Turn Undead"},{level:4,name:"ASI"},{level:5,name:"Destroy Undead"},{level:10,name:"Divine Intervention"}] },
  { name: "Druid", hitDie: "1d8", primaryAbility: ["Wisdom"], savingThrows: ["Intelligence","Wisdom"], spellcasting: "Wisdom", armorProf: ["Light armor","Medium armor","Shields (non-metal)"], weaponProf: ["Clubs","Daggers","Darts","Javelins","Maces","Quarterstaffs","Scimitars","Sickles","Slings","Spears"], skillChoices: 2, skillList: ["Arcana","Animal Handling","Insight","Medicine","Nature","Perception","Religion","Survival"], features: [{level:1,name:"Druidic"},{level:1,name:"Spellcasting"},{level:2,name:"Wild Shape"},{level:2,name:"Druid Circle"},{level:4,name:"ASI"},{level:18,name:"Timeless Body"},{level:18,name:"Beast Spells"},{level:20,name:"Archdruid"}] },
  { name: "Fighter", hitDie: "1d10", primaryAbility: ["Strength","Dexterity"], savingThrows: ["Strength","Constitution"], spellcasting: null, armorProf: ["All armor","Shields"], weaponProf: ["Simple weapons","Martial weapons"], skillChoices: 2, skillList: ["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Survival"], features: [{level:1,name:"Fighting Style"},{level:1,name:"Second Wind"},{level:2,name:"Action Surge"},{level:3,name:"Martial Archetype"},{level:4,name:"ASI"},{level:5,name:"Extra Attack"},{level:9,name:"Indomitable"},{level:11,name:"Extra Attack (2)"},{level:20,name:"Extra Attack (3)"}] },
  { name: "Monk", hitDie: "1d8", primaryAbility: ["Dexterity","Wisdom"], savingThrows: ["Strength","Dexterity"], spellcasting: null, armorProf: [], weaponProf: ["Simple weapons","Shortswords"], skillChoices: 2, skillList: ["Acrobatics","Athletics","History","Insight","Religion","Stealth"], features: [{level:1,name:"Unarmored Defense"},{level:1,name:"Martial Arts"},{level:2,name:"Ki"},{level:2,name:"Unarmored Movement"},{level:3,name:"Monastic Tradition"},{level:3,name:"Deflect Missiles"},{level:4,name:"Slow Fall"},{level:5,name:"Extra Attack"},{level:5,name:"Stunning Strike"},{level:6,name:"Ki-Empowered Strikes"},{level:7,name:"Evasion"},{level:10,name:"Purity of Body"},{level:14,name:"Diamond Soul"},{level:18,name:"Empty Body"},{level:20,name:"Perfect Self"}] },
  { name: "Paladin", hitDie: "1d10", primaryAbility: ["Strength","Charisma"], savingThrows: ["Wisdom","Charisma"], spellcasting: "Charisma", armorProf: ["All armor","Shields"], weaponProf: ["Simple weapons","Martial weapons"], skillChoices: 2, skillList: ["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"], features: [{level:1,name:"Divine Sense"},{level:1,name:"Lay on Hands"},{level:2,name:"Fighting Style"},{level:2,name:"Spellcasting"},{level:2,name:"Divine Smite"},{level:3,name:"Divine Health"},{level:3,name:"Sacred Oath"},{level:5,name:"Extra Attack"},{level:6,name:"Aura of Protection"},{level:10,name:"Aura of Courage"},{level:11,name:"Improved Divine Smite"},{level:14,name:"Cleansing Touch"}] },
  { name: "Ranger", hitDie: "1d10", primaryAbility: ["Dexterity","Wisdom"], savingThrows: ["Strength","Dexterity"], spellcasting: "Wisdom", armorProf: ["Light armor","Medium armor","Shields"], weaponProf: ["Simple weapons","Martial weapons"], skillChoices: 3, skillList: ["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"], features: [{level:1,name:"Favored Enemy"},{level:1,name:"Natural Explorer"},{level:2,name:"Fighting Style"},{level:2,name:"Spellcasting"},{level:3,name:"Ranger Archetype"},{level:3,name:"Primeval Awareness"},{level:4,name:"ASI"},{level:5,name:"Extra Attack"},{level:8,name:"Land's Stride"},{level:10,name:"Hide in Plain Sight"},{level:14,name:"Vanish"},{level:18,name:"Feral Senses"},{level:20,name:"Foe Slayer"}] },
  { name: "Rogue", hitDie: "1d8", primaryAbility: ["Dexterity"], savingThrows: ["Dexterity","Intelligence"], spellcasting: null, armorProf: ["Light armor"], weaponProf: ["Simple weapons","Hand crossbows","Longswords","Rapiers","Shortswords"], skillChoices: 4, skillList: ["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Performance","Persuasion","Sleight of Hand","Stealth"], features: [{level:1,name:"Expertise"},{level:1,name:"Sneak Attack"},{level:1,name:"Thieves' Cant"},{level:2,name:"Cunning Action"},{level:3,name:"Roguish Archetype"},{level:4,name:"ASI"},{level:5,name:"Uncanny Dodge"},{level:7,name:"Evasion"},{level:11,name:"Reliable Talent"},{level:14,name:"Blindsense"},{level:15,name:"Slippery Mind"},{level:18,name:"Elusive"},{level:20,name:"Stroke of Luck"}] },
  { name: "Sorcerer", hitDie: "1d6", primaryAbility: ["Charisma"], savingThrows: ["Constitution","Charisma"], spellcasting: "Charisma", armorProf: [], weaponProf: ["Daggers","Darts","Slings","Quarterstaffs","Light crossbows"], skillChoices: 2, skillList: ["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"], features: [{level:1,name:"Spellcasting"},{level:1,name:"Sorcerous Origin"},{level:2,name:"Font of Magic"},{level:3,name:"Metamagic"},{level:4,name:"ASI"},{level:20,name:"Sorcerous Restoration"}] },
  { name: "Warlock", hitDie: "1d8", primaryAbility: ["Charisma"], savingThrows: ["Wisdom","Charisma"], spellcasting: "Charisma", spellcastingType: "pact", armorProf: ["Light armor"], weaponProf: ["Simple weapons"], skillChoices: 2, skillList: ["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"], features: [{level:1,name:"Otherworldly Patron"},{level:1,name:"Pact Magic"},{level:2,name:"Eldritch Invocations"},{level:3,name:"Pact Boon"},{level:4,name:"ASI"},{level:11,name:"Mystic Arcanum (6th)"},{level:13,name:"Mystic Arcanum (7th)"},{level:15,name:"Mystic Arcanum (8th)"},{level:17,name:"Mystic Arcanum (9th)"},{level:20,name:"Eldritch Master"}] },
  { name: "Wizard", hitDie: "1d6", primaryAbility: ["Intelligence"], savingThrows: ["Intelligence","Wisdom"], spellcasting: "Intelligence", armorProf: [], weaponProf: ["Daggers","Darts","Slings","Quarterstaffs","Light crossbows"], skillChoices: 2, skillList: ["Arcana","History","Insight","Investigation","Medicine","Religion"], features: [{level:1,name:"Spellcasting"},{level:1,name:"Arcane Recovery"},{level:2,name:"Arcane Tradition"},{level:4,name:"ASI"},{level:18,name:"Spell Mastery"},{level:20,name:"Signature Spells"}] },
];

const SUBCLASSES_DATA = {
  Barbarian: ["Path of the Berserker","Path of the Totem Warrior"],
  Bard: ["College of Lore","College of Valor"],
  Cleric: ["Knowledge Domain","Life Domain","Light Domain","Nature Domain","Tempest Domain","Trickery Domain","War Domain"],
  Druid: ["Circle of the Land","Circle of the Moon"],
  Fighter: ["Champion","Battle Master","Eldritch Knight"],
  Monk: ["Way of the Open Hand","Way of Shadow","Way of the Four Elements"],
  Paladin: ["Oath of Devotion","Oath of the Ancients","Oath of Vengeance"],
  Ranger: ["Hunter","Beast Master"],
  Rogue: ["Thief","Assassin","Arcane Trickster"],
  Sorcerer: ["Draconic Bloodline","Wild Magic"],
  Warlock: ["The Archfey","The Fiend","The Great Old One"],
  Wizard: ["School of Abjuration","School of Conjuration","School of Divination","School of Enchantment","School of Evocation","School of Illusion","School of Necromancy","School of Transmutation"],
};

const BACKGROUNDS_DATA = [
  { name: "Acolyte", skillProf: ["Insight","Religion"], toolProf: [], languages: 2, feature: "Shelter of the Faithful", traits: ["I idolize a particular hero of my faith.","I see omens in every event and action.","Nothing can shake my optimistic attitude.","I quote sacred texts in almost every situation."], ideals: ["Tradition","Charity","Change","Power","Faith","Aspiration"], bonds: ["I would die to recover an ancient relic of my faith.","I owe my life to the priest who took me in.","I will do anything to protect the temple where I served."], flaws: ["I judge others harshly, and myself even more severely.","I am inflexible in my thinking.","I am suspicious of strangers."] },
  { name: "Charlatan", skillProf: ["Deception","Sleight of Hand"], toolProf: ["Disguise kit","Forgery kit"], languages: 0, feature: "False Identity", traits: ["I fall in and out of love easily.","I have a tell that reveals when I'm lying.","I'm a born gambler who can't resist a wager."], ideals: ["Independence","Fairness","Charity","Creativity","Friendship","Aspiration"], bonds: ["I fleeced the wrong person and must pay back the debt.","I owe everything to my mentor."], flaws: ["I can't resist a pretty face.","I'm always in debt.","I'm convinced that no one could ever fool me."] },
  { name: "Criminal", skillProf: ["Deception","Stealth"], toolProf: ["Thieves' tools","One type of gaming set"], languages: 0, feature: "Criminal Contact", traits: ["I always have a plan for when things go wrong.","I prefer to get in and out without a fight.","The best way to get me to do something is to tell me I can't do it."], ideals: ["Honor","Freedom","Charity","Greed","People","Redemption"], bonds: ["I'm trying to pay off an old debt I owe to a generous benefactor.","My ill-gotten gains go to support my family."], flaws: ["When I see something valuable, I can't think about anything else.","I turn tail and run when things look bad."] },
  { name: "Entertainer", skillProf: ["Acrobatics","Performance"], toolProf: ["Disguise kit","One musical instrument"], languages: 0, feature: "By Popular Demand", traits: ["I know a story relevant to almost every situation.","Whenever I come to a new place, I collect local rumors.","I love a good insult."], ideals: ["Beauty","Tradition","Creativity","Greed","People","Honesty"], bonds: ["I pursue greatness to please my mentor.","I will do anything to prove myself superior to my hated rival."], flaws: ["I'll do anything to win fame and renown.","I change my mood like a flip of a coin."] },
  { name: "Folk Hero", skillProf: ["Animal Handling","Survival"], toolProf: ["One type of artisan's tools","Vehicles (land)"], languages: 0, feature: "Rustic Hospitality", traits: ["I judge people by their actions, not words.","If someone is in trouble, I'm always ready to lend a hand.","When I set my mind to something I follow through."], ideals: ["Respect","Fairness","Freedom","Might","Sincerity","Destiny"], bonds: ["I have a family, but I have no idea where they are.","I protect those who cannot protect themselves."], flaws: ["The tyrant who rules my land will stop at nothing to see me ruined.","I have trouble trusting in my allies."] },
  { name: "Guild Artisan", skillProf: ["Insight","Persuasion"], toolProf: ["One type of artisan's tools"], languages: 1, feature: "Guild Membership", traits: ["I believe anything worth doing is worth doing right.","I'm rude to people who lack my commitment to hard work.","There's nothing I like more than a good mystery."], ideals: ["Community","Generosity","Freedom","Greed","People","Aspiration"], bonds: ["The workshop where I learned my trade is the most important place in the world to me.","I owe my guild a great debt for forging me into the person I am today."], flaws: ["I'll do anything to get my hands on something rare or priceless.","I'm quick to assume that someone is trying to cheat me."] },
  { name: "Hermit", skillProf: ["Medicine","Religion"], toolProf: ["Herbalism kit"], languages: 1, feature: "Discovery", traits: ["I've been isolated so long that I rarely speak, preferring gestures.","I am utterly serene, even in the face of disaster.","I connect everything that happens to me to a grand, cosmic plan."], ideals: ["Greater Good","Logic","Free Thinking","Power","Live and Let Live","Self-Knowledge"], bonds: ["I entered seclusion to hide from the ones who might still be hunting me.","I'm still seeking the enlightenment I pursued in seclusion."], flaws: ["I harbor dark, bloodthirsty thoughts.","I am dogmatic in my thoughts and philosophy."] },
  { name: "Noble", skillProf: ["History","Persuasion"], toolProf: ["One type of gaming set"], languages: 1, feature: "Position of Privilege", traits: ["My eloquent flattery makes everyone I talk to feel like the smartest person in the room.","The common folk love me for my kindness and generosity.","I take great pains to always look my best."], ideals: ["Respect","Responsibility","Independence","Power","Family","Noble Obligation"], bonds: ["I will face any challenge to win the approval of my family.","My loyalty to my sovereign is unwavering."], flaws: ["I secretly believe that everyone is beneath me.","I hide a truly scandalous secret that could ruin my family forever."] },
  { name: "Outlander", skillProf: ["Athletics","Survival"], toolProf: ["One type of musical instrument"], languages: 1, feature: "Wanderer", traits: ["I'm driven by a wanderlust that led me away from home.","I watch over my friends as if they were a litter of newborn pups.","I have a lesson for every situation, drawn from observing nature."], ideals: ["Change","Greater Good","Honor","Might","Nature","Glory"], bonds: ["My family, clan, or tribe is the most important thing in my life.","An injury to the unspoiled wilderness is an injury to me."], flaws: ["I am slow to trust members of other races.","Violence is my answer to almost any challenge."] },
  { name: "Sage", skillProf: ["Arcana","History"], toolProf: [], languages: 2, feature: "Researcher", traits: ["I use polysyllabic words that convey the impression of great erudition.","I've read every book in the world's greatest libraries—or I like to boast that I have.","I'm used to helping out those who aren't as smart as I am."], ideals: ["Knowledge","Beauty","Logic","No Limits","Power","Self-Improvement"], bonds: ["I have an ancient text that holds terrible secrets that must not fall into the wrong hands.","I have been searching my whole life for the answer to a certain question."], flaws: ["I speak without thinking, often insulting others.","I overlook obvious solutions in favor of complicated ones."] },
  { name: "Sailor", skillProf: ["Athletics","Perception"], toolProf: ["Navigator's tools","Vehicles (water)"], languages: 0, feature: "Ship's Passage", traits: ["My friends know they can rely on me, no matter what.","I work hard so others don't have to.","I enjoy sailing into new ports and making new friends over a flagon of ale."], ideals: ["Respect","Fairness","Freedom","Mastery","People","Aspiration"], bonds: ["I have a vessel I consider my home.","I have a debt I can never repay to the person who took pity on me."], flaws: ["I follow orders, even if I think they're wrong.","Once someone questions my courage, I never back down."] },
  { name: "Soldier", skillProf: ["Athletics","Intimidation"], toolProf: ["One type of gaming set","Vehicles (land)"], languages: 0, feature: "Military Rank", traits: ["I'm always polite and respectful.","I'm haunted by memories of war.","I've lost too many friends, and I'm slow to make new ones."], ideals: ["Greater Good","Responsibility","Independence","Might","Live and Let Live","Nation"], bonds: ["I would still lay down my life for the people I served with.","Someone saved my life on the battlefield. To this day, I will put their needs before my own."], flaws: ["The monstrous enemy we faced has made me a monster too.","I have little respect for anyone who is not a proven warrior."] },
  { name: "Urchin", skillProf: ["Sleight of Hand","Stealth"], toolProf: ["Disguise kit","Thieves' tools"], languages: 0, feature: "City Secrets", traits: ["I hide scraps of food and trinkets away in my pockets.","I ask a lot of questions.","I bluntly say what other people are hinting at or trying to hide."], ideals: ["Respect","Community","Change","Greater Good","People","Aspiration"], bonds: ["My town or city is my home, and I'll fight to defend it.","I sponsor an orphanage to keep others from enduring what I was forced to endure."], flaws: ["If I'm outnumbered, I always run away from a fight.","Gold seems like a lot of money to me, and I'll do just about anything for more of it."] },
];

const FEATS_DATA = [
  { name: "Alert", prereq: null, benefits: ["+5 bonus to initiative","Can't be surprised while conscious","Others don't gain advantage from being hidden"] },
  { name: "Athlete", prereq: null, benefits: ["+1 STR or DEX","Standing up uses only 5 feet of movement","Climbing doesn't halve speed"] },
  { name: "Actor", prereq: null, benefits: ["+1 CHA","Advantage on Deception/Performance when impersonating","Can mimic speech of others"] },
  { name: "Charger", prereq: null, benefits: ["After Dash, bonus action melee attack or shove","10+ ft straight: +5 damage or push 10 ft"] },
  { name: "Crossbow Expert", prereq: null, benefits: ["Ignore loading for crossbows","No disadvantage in melee with ranged","Bonus action hand crossbow attack"] },
  { name: "Defensive Duelist", prereq: "DEX 13+", benefits: ["Reaction: add proficiency to AC vs one melee hit"] },
  { name: "Dual Wielder", prereq: null, benefits: ["+1 AC with two weapons","Two-weapon fighting without Light requirement","Draw/stow two weapons at once"] },
  { name: "Dungeon Delver", prereq: null, benefits: ["Advantage detecting secret doors","Advantage vs traps","Resistance to trap damage"] },
  { name: "Durable", prereq: null, benefits: ["+1 CON","Minimum hit dice recovery = twice CON modifier"] },
  { name: "Elemental Adept", prereq: "Spellcasting", benefits: ["Choose energy type: ignore resistance","Treat 1s as 2s on damage dice for that type"] },
  { name: "Grappler", prereq: "STR 13+", benefits: ["Advantage on attacks vs grappled creature","Can pin: restrained (both)"] },
  { name: "Great Weapon Master", prereq: null, benefits: ["Crit or kill: bonus action attack","Take -5 to hit for +10 damage"] },
  { name: "Healer", prereq: null, benefits: ["Stabilize with healer's kit restores 1 HP","Healer's kit: heal 1d6+4+HD HP (once per short rest per creature)"] },
  { name: "Heavily Armored", prereq: "Medium Armor Prof", benefits: ["+1 STR","Heavy armor proficiency"] },
  { name: "Heavy Armor Master", prereq: "Heavy Armor Prof", benefits: ["+1 STR","Reduce bludgeoning/piercing/slashing by 3 while in heavy armor"] },
  { name: "Inspiring Leader", prereq: "CHA 13+", benefits: ["10-min speech: up to 6 allies gain temp HP = level + CHA mod"] },
  { name: "Keen Mind", prereq: null, benefits: ["+1 INT","Always know N/S direction","Track hours without sleep","Recall anything seen/heard in past month"] },
  { name: "Lightly Armored", prereq: null, benefits: ["+1 STR or DEX","Light armor proficiency"] },
  { name: "Linguist", prereq: null, benefits: ["+1 INT","Learn 3 languages","Create ciphers"] },
  { name: "Lucky", prereq: null, benefits: ["3 luck points per long rest","Spend to roll extra d20 on attack/ability/save","Spend to cancel enemy advantage"] },
  { name: "Mage Slayer", prereq: null, benefits: ["Reaction: attack caster in melee","Concentration save disadvantage for nearby casters","Advantage on saves vs nearby spells"] },
  { name: "Magic Initiate", prereq: null, benefits: ["Learn 2 cantrips + 1 1st-level spell from chosen class list","Cast 1st-level spell once per long rest"] },
  { name: "Martial Adept", prereq: null, benefits: ["Learn 2 Battle Master maneuvers","Gain 1 superiority die (d6)"] },
  { name: "Medium Armor Master", prereq: "Medium Armor Prof", benefits: ["No stealth disadvantage in medium armor","Max DEX bonus to AC = +3 in medium armor"] },
  { name: "Mobile", prereq: null, benefits: ["+10 ft speed","Dash over difficult terrain costs no extra","No opportunity attacks from creatures you attacked"] },
  { name: "Moderately Armored", prereq: "Light Armor Prof", benefits: ["+1 STR or DEX","Medium armor and shield proficiency"] },
  { name: "Mounted Combatant", prereq: null, benefits: ["Advantage vs unmounted smaller creatures","Force attacks to target you instead of mount","Mount succeeds vs Dex saves on half-damage"] },
  { name: "Observant", prereq: null, benefits: ["+1 INT or WIS","+5 to passive Perception and Investigation","Lip reading"] },
  { name: "Polearm Master", prereq: null, benefits: ["Bonus action butt attack with glaive/halberd/pike/quarterstaff","Opportunity attack when creature enters reach"] },
  { name: "Resilient", prereq: null, benefits: ["+1 to chosen ability score","Proficiency in saving throws for that ability"] },
  { name: "Ritual Caster", prereq: "INT or WIS 13+", benefits: ["Learn 2 rituals from chosen class","Can cast them as rituals (not spell slots)"] },
  { name: "Savage Attacker", prereq: null, benefits: ["Once per turn on melee: reroll damage dice, take higher result"] },
  { name: "Sentinel", prereq: null, benefits: ["Opportunity attacks reduce speed to 0","Can make opportunity attack when creature Disengages","Reaction attack when creature attacks adjacent ally"] },
  { name: "Sharpshooter", prereq: null, benefits: ["No disadvantage at long range","Ignore half/3/4 cover","-5 to hit for +10 damage"] },
  { name: "Shield Master", prereq: null, benefits: ["Bonus action shove after Attack action","Add shield to Dex saves targeting only you","No damage on Dex save if succeed"] },
  { name: "Skilled", prereq: null, benefits: ["Gain proficiency in 3 skills or tools"] },
  { name: "Skulker", prereq: "DEX 13+", benefits: ["Hide when lightly obscured","Missing a shot doesn't reveal location","Dim light doesn't impose disadvantage on Perception"] },
  { name: "Spell Sniper", prereq: "Spellcasting", benefits: ["Double range of attack roll spells","Ignore half/3/4 cover","Learn 1 attack cantrip"] },
  { name: "Tavern Brawler", prereq: null, benefits: ["+1 STR or CON","Proficient with improvised weapons","Unarmed strike 1d4","Free grapple on hit"] },
  { name: "Tough", prereq: null, benefits: ["HP max +2 per level (past and future)"] },
  { name: "War Caster", prereq: "Spellcasting", benefits: ["Advantage on Concentration saves","Somatic components with hands full","Opportunity attack with spell"] },
  { name: "Weapon Master", prereq: null, benefits: ["+1 STR or DEX","Proficiency with 4 weapons of your choice"] },
];

const ALL_WEAPONS = [
  {name:"Club",cat:"Simple Melee",damage:"1d4",type:"bludgeoning",range:"melee",props:["Light"]},
  {name:"Dagger",cat:"Simple Melee",damage:"1d4",type:"piercing",range:"20/60",props:["Finesse","Light","Thrown"]},
  {name:"Greatclub",cat:"Simple Melee",damage:"1d8",type:"bludgeoning",range:"melee",props:["Two-handed"]},
  {name:"Handaxe",cat:"Simple Melee",damage:"1d6",type:"slashing",range:"20/60",props:["Light","Thrown"]},
  {name:"Javelin",cat:"Simple Melee",damage:"1d6",type:"piercing",range:"30/120",props:["Thrown"]},
  {name:"Light hammer",cat:"Simple Melee",damage:"1d4",type:"bludgeoning",range:"20/60",props:["Light","Thrown"]},
  {name:"Mace",cat:"Simple Melee",damage:"1d6",type:"bludgeoning",range:"melee",props:[]},
  {name:"Quarterstaff",cat:"Simple Melee",damage:"1d6",type:"bludgeoning",range:"melee",props:["Versatile (1d8)"]},
  {name:"Sickle",cat:"Simple Melee",damage:"1d4",type:"slashing",range:"melee",props:["Light"]},
  {name:"Spear",cat:"Simple Melee",damage:"1d6",type:"piercing",range:"20/60",props:["Thrown","Versatile (1d8)"]},
  {name:"Crossbow, light",cat:"Simple Ranged",damage:"1d8",type:"piercing",range:"80/320",props:["Ammunition","Loading","Two-handed"]},
  {name:"Dart",cat:"Simple Ranged",damage:"1d4",type:"piercing",range:"20/60",props:["Finesse","Thrown"]},
  {name:"Shortbow",cat:"Simple Ranged",damage:"1d6",type:"piercing",range:"80/320",props:["Ammunition","Two-handed"]},
  {name:"Sling",cat:"Simple Ranged",damage:"1d4",type:"bludgeoning",range:"30/120",props:["Ammunition"]},
  {name:"Battleaxe",cat:"Martial Melee",damage:"1d8",type:"slashing",range:"melee",props:["Versatile (1d10)"]},
  {name:"Flail",cat:"Martial Melee",damage:"1d8",type:"bludgeoning",range:"melee",props:[]},
  {name:"Glaive",cat:"Martial Melee",damage:"1d10",type:"slashing",range:"melee",props:["Heavy","Reach","Two-handed"]},
  {name:"Greataxe",cat:"Martial Melee",damage:"1d12",type:"slashing",range:"melee",props:["Heavy","Two-handed"]},
  {name:"Greatsword",cat:"Martial Melee",damage:"2d6",type:"slashing",range:"melee",props:["Heavy","Two-handed"]},
  {name:"Halberd",cat:"Martial Melee",damage:"1d10",type:"slashing",range:"melee",props:["Heavy","Reach","Two-handed"]},
  {name:"Lance",cat:"Martial Melee",damage:"1d12",type:"piercing",range:"melee",props:["Reach","Special"]},
  {name:"Longsword",cat:"Martial Melee",damage:"1d8",type:"slashing",range:"melee",props:["Versatile (1d10)"]},
  {name:"Maul",cat:"Martial Melee",damage:"2d6",type:"bludgeoning",range:"melee",props:["Heavy","Two-handed"]},
  {name:"Morningstar",cat:"Martial Melee",damage:"1d8",type:"piercing",range:"melee",props:[]},
  {name:"Pike",cat:"Martial Melee",damage:"1d10",type:"piercing",range:"melee",props:["Heavy","Reach","Two-handed"]},
  {name:"Rapier",cat:"Martial Melee",damage:"1d8",type:"piercing",range:"melee",props:["Finesse"]},
  {name:"Scimitar",cat:"Martial Melee",damage:"1d6",type:"slashing",range:"melee",props:["Finesse","Light"]},
  {name:"Shortsword",cat:"Martial Melee",damage:"1d6",type:"piercing",range:"melee",props:["Finesse","Light"]},
  {name:"Trident",cat:"Martial Melee",damage:"1d6",type:"piercing",range:"20/60",props:["Thrown","Versatile (1d8)"]},
  {name:"War pick",cat:"Martial Melee",damage:"1d8",type:"piercing",range:"melee",props:[]},
  {name:"Warhammer",cat:"Martial Melee",damage:"1d8",type:"bludgeoning",range:"melee",props:["Versatile (1d10)"]},
  {name:"Whip",cat:"Martial Melee",damage:"1d4",type:"slashing",range:"melee",props:["Finesse","Reach"]},
  {name:"Blowgun",cat:"Martial Ranged",damage:"1",type:"piercing",range:"25/100",props:["Ammunition","Loading"]},
  {name:"Crossbow, hand",cat:"Martial Ranged",damage:"1d6",type:"piercing",range:"30/120",props:["Ammunition","Light","Loading"]},
  {name:"Crossbow, heavy",cat:"Martial Ranged",damage:"1d10",type:"piercing",range:"100/400",props:["Ammunition","Heavy","Loading","Two-handed"]},
  {name:"Longbow",cat:"Martial Ranged",damage:"1d8",type:"piercing",range:"150/600",props:["Ammunition","Heavy","Two-handed"]},
  {name:"Net",cat:"Martial Ranged",damage:"—",type:"—",range:"5/15",props:["Thrown","Special"]},
];

const ALL_ARMOR = [
  {name:"Padded",cat:"Light",ac:"11 + DEX",stealthDisadv:true,strReq:null,weight:"8 lb."},
  {name:"Leather",cat:"Light",ac:"11 + DEX",stealthDisadv:false,strReq:null,weight:"10 lb."},
  {name:"Studded Leather",cat:"Light",ac:"12 + DEX",stealthDisadv:false,strReq:null,weight:"13 lb."},
  {name:"Hide",cat:"Medium",ac:"12 + DEX (max 2)",stealthDisadv:false,strReq:null,weight:"12 lb."},
  {name:"Chain Shirt",cat:"Medium",ac:"13 + DEX (max 2)",stealthDisadv:false,strReq:null,weight:"20 lb."},
  {name:"Scale Mail",cat:"Medium",ac:"14 + DEX (max 2)",stealthDisadv:true,strReq:null,weight:"45 lb."},
  {name:"Breastplate",cat:"Medium",ac:"14 + DEX (max 2)",stealthDisadv:false,strReq:null,weight:"20 lb."},
  {name:"Half Plate",cat:"Medium",ac:"15 + DEX (max 2)",stealthDisadv:true,strReq:null,weight:"40 lb."},
  {name:"Ring Mail",cat:"Heavy",ac:"14",stealthDisadv:true,strReq:null,weight:"40 lb."},
  {name:"Chain Mail",cat:"Heavy",ac:"16",stealthDisadv:true,strReq:"Str 13",weight:"55 lb."},
  {name:"Splint",cat:"Heavy",ac:"17",stealthDisadv:true,strReq:"Str 15",weight:"60 lb."},
  {name:"Plate",cat:"Heavy",ac:"18",stealthDisadv:true,strReq:"Str 15",weight:"65 lb."},
  {name:"Shield",cat:"Shield",ac:"+2",stealthDisadv:false,strReq:null,weight:"6 lb."},
];

// Spell slots: [1st,2nd,3rd,4th,5th,6th,7th,8th,9th] per level
const FULL_CASTER_SLOTS = {
  1:[2,0,0,0,0,0,0,0,0], 2:[3,0,0,0,0,0,0,0,0], 3:[4,2,0,0,0,0,0,0,0], 4:[4,3,0,0,0,0,0,0,0],
  5:[4,3,2,0,0,0,0,0,0], 6:[4,3,3,0,0,0,0,0,0], 7:[4,3,3,1,0,0,0,0,0], 8:[4,3,3,2,0,0,0,0,0],
  9:[4,3,3,3,1,0,0,0,0], 10:[4,3,3,3,2,0,0,0,0], 11:[4,3,3,3,2,1,0,0,0], 12:[4,3,3,3,2,1,0,0,0],
  13:[4,3,3,3,2,1,1,0,0], 14:[4,3,3,3,2,1,1,0,0], 15:[4,3,3,3,2,1,1,1,0], 16:[4,3,3,3,2,1,1,1,0],
  17:[4,3,3,3,2,1,1,1,1], 18:[4,3,3,3,3,1,1,1,1], 19:[4,3,3,3,3,2,1,1,1], 20:[4,3,3,3,3,2,2,1,1],
};
const HALF_CASTER_SLOTS = {
  1:[0,0,0,0,0,0,0,0,0], 2:[2,0,0,0,0,0,0,0,0], 3:[3,0,0,0,0,0,0,0,0], 4:[3,0,0,0,0,0,0,0,0],
  5:[4,2,0,0,0,0,0,0,0], 6:[4,2,0,0,0,0,0,0,0], 7:[4,3,0,0,0,0,0,0,0], 8:[4,3,0,0,0,0,0,0,0],
  9:[4,3,2,0,0,0,0,0,0], 10:[4,3,2,0,0,0,0,0,0], 11:[4,3,3,0,0,0,0,0,0], 12:[4,3,3,0,0,0,0,0,0],
  13:[4,3,3,1,0,0,0,0,0], 14:[4,3,3,1,0,0,0,0,0], 15:[4,3,3,2,0,0,0,0,0], 16:[4,3,3,2,0,0,0,0,0],
  17:[4,3,3,3,1,0,0,0,0], 18:[4,3,3,3,1,0,0,0,0], 19:[4,3,3,3,2,0,0,0,0], 20:[4,3,3,3,2,0,0,0,0],
};
// Warlock pact magic: {slots, level} per char level
const WARLOCK_SLOTS = {
  1:{count:1,spellLevel:1}, 2:{count:2,spellLevel:1}, 3:{count:2,spellLevel:2}, 4:{count:2,spellLevel:2},
  5:{count:2,spellLevel:3}, 6:{count:2,spellLevel:3}, 7:{count:2,spellLevel:4}, 8:{count:2,spellLevel:4},
  9:{count:2,spellLevel:5}, 10:{count:2,spellLevel:5}, 11:{count:3,spellLevel:5}, 12:{count:3,spellLevel:5},
  13:{count:3,spellLevel:5}, 14:{count:3,spellLevel:5}, 15:{count:3,spellLevel:5}, 16:{count:3,spellLevel:5},
  17:{count:4,spellLevel:5}, 18:{count:4,spellLevel:5}, 19:{count:4,spellLevel:5}, 20:{count:4,spellLevel:5},
};

const SPELL_LISTS = {
  Bard: { cantrips:["Blade Ward","Dancing Lights","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Prestidigitation","True Strike","Vicious Mockery"], "1st":["Animal Friendship","Bane","Charm Person","Comprehend Languages","Cure Wounds","Detect Magic","Disguise Self","Dissonant Whispers","Faerie Fire","Feather Fall","Healing Word","Heroism","Identify","Longstrider","Silent Image","Sleep","Speak with Animals","Tasha's Hideous Laughter","Thunderwave","Unseen Servant"], "2nd":["Animal Messenger","Blindness/Deafness","Calm Emotions","Cloud of Daggers","Crown of Madness","Detect Thoughts","Enhance Ability","Enthrall","Heat Metal","Hold Person","Invisibility","Knock","Lesser Restoration","Locate Object","Magic Mouth","Phantasmal Force","See Invisibility","Shatter","Silence","Suggestion","Zone of Truth"], "3rd":["Bestow Curse","Clairvoyance","Dispel Magic","Fear","Feign Death","Glyph of Warding","Hypnotic Pattern","Major Image","Nondetection","Plant Growth","Sending","Speak with Dead","Stinking Cloud","Tongues"], "4th":["Compulsion","Confusion","Dimension Door","Freedom of Movement","Greater Invisibility","Hallucinatory Terrain","Locate Creature","Polymorph"], "5th":["Animate Objects","Awaken","Dominate Person","Dream","Geas","Greater Restoration","Hold Monster","Legend Lore","Mass Cure Wounds","Mislead","Modify Memory","Raise Dead","Scrying","Seeming","Teleportation Circle"], "6th":["Eyebite","Find the Path","Guards and Wards","Mass Suggestion","Otto's Irresistible Dance","True Seeing"], "7th":["Etherealness","Forcecage","Mirage Arcane","Project Image","Regenerate","Resurrection","Symbol","Teleport"], "8th":["Dominate Monster","Feeblemind","Glibness","Mind Blank","Power Word Stun"], "9th":["Foresight","Power Word Heal","Power Word Kill","True Polymorph"] },
  Cleric: { cantrips:["Guidance","Light","Mending","Resistance","Sacred Flame","Spare the Dying","Thaumaturgy"], "1st":["Bane","Bless","Command","Create or Destroy Water","Cure Wounds","Detect Evil and Good","Detect Magic","Guiding Bolt","Healing Word","Inflict Wounds","Protection from Evil and Good","Purify Food and Drink","Sanctuary","Shield of Faith"], "2nd":["Aid","Augury","Blindness/Deafness","Calm Emotions","Continual Flame","Enhance Ability","Find Traps","Gentle Repose","Hold Person","Lesser Restoration","Locate Object","Prayer of Healing","Protection from Poison","Silence","Spiritual Weapon","Warding Bond","Zone of Truth"], "3rd":["Animate Dead","Beacon of Hope","Bestow Curse","Clairvoyance","Create Food and Water","Daylight","Dispel Magic","Feign Death","Glyph of Warding","Magic Circle","Protection from Energy","Remove Curse","Revivify","Sending","Speak with Dead","Spirit Guardians","Tongues","Water Walk"], "4th":["Banishment","Control Water","Death Ward","Divination","Freedom of Movement","Guardian of Faith","Locate Creature","Stone Shape"], "5th":["Commune","Contagion","Dispel Evil and Good","Flame Strike","Geas","Greater Restoration","Hallow","Insect Plague","Legend Lore","Mass Cure Wounds","Planar Binding","Raise Dead","Scrying"], "6th":["Blade Barrier","Create Undead","Find the Path","Forbiddance","Harm","Heal","Heroes' Feast","Planar Ally","True Seeing","Word of Recall"], "7th":["Conjure Celestial","Divine Word","Etherealness","Fire Storm","Plane Shift","Regenerate","Resurrection","Symbol"], "8th":["Antimagic Field","Control Weather","Earthquake","Holy Aura"], "9th":["Astral Projection","Gate","Mass Heal","True Resurrection"] },
  Druid: { cantrips:["Druidcraft","Guidance","Mending","Poison Spray","Produce Flame","Resistance","Shillelagh","Thorn Whip"], "1st":["Animal Friendship","Charm Person","Create or Destroy Water","Cure Wounds","Detect Magic","Detect Poison and Disease","Entangle","Faerie Fire","Fog Cloud","Goodberry","Healing Word","Jump","Longstrider","Purify Food and Drink","Speak with Animals","Thunderwave"], "2nd":["Animal Messenger","Barkskin","Beast Sense","Darkvision","Enhance Ability","Find Traps","Flame Blade","Flaming Sphere","Gust of Wind","Heat Metal","Hold Person","Lesser Restoration","Locate Animals or Plants","Locate Object","Moonbeam","Pass Without Trace","Protection from Poison","Spike Growth"], "3rd":["Call Lightning","Conjure Animals","Daylight","Dispel Magic","Feign Death","Meld into Stone","Plant Growth","Protection from Energy","Sleet Storm","Speak with Plants","Water Breathing","Water Walk","Wind Wall"], "4th":["Blight","Confusion","Conjure Minor Elementals","Conjure Woodland Beings","Control Water","Dominate Beast","Freedom of Movement","Giant Insect","Hallucinatory Terrain","Ice Storm","Locate Creature","Polymorph","Stone Shape","Stoneskin","Wall of Fire"], "5th":["Antilife Shell","Awaken","Commune with Nature","Conjure Elemental","Contagion","Geas","Greater Restoration","Insect Plague","Mass Cure Wounds","Planar Binding","Reincarnate","Scrying","Tree Stride","Wall of Stone"], "6th":["Conjure Fey","Find the Path","Heal","Heroes' Feast","Move Earth","Sunbeam","Transport via Plants","True Seeing","Wall of Thorns","Wind Walk"], "7th":["Fire Storm","Mirage Arcane","Plane Shift","Regenerate","Reverse Gravity"], "8th":["Animal Shapes","Antipathy/Sympathy","Control Weather","Earthquake","Feeblemind","Sunburst"], "9th":["Foresight","Shapechange","Storm of Vengeance","True Resurrection"] },
  Paladin: { cantrips:[], "1st":["Bless","Command","Compelled Duel","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Divine Favor","Heroism","Protection from Evil and Good","Purify Food and Drink","Searing Smite","Shield of Faith","Thunderous Smite","Wrathful Smite"], "2nd":["Aid","Branding Smite","Find Steed","Lesser Restoration","Locate Object","Magic Weapon","Protection from Poison","Zone of Truth"], "3rd":["Aura of Vitality","Blinding Smite","Create Food and Water","Crusader's Mantle","Daylight","Dispel Magic","Elemental Weapon","Magic Circle","Remove Curse","Revivify"], "4th":["Aura of Life","Aura of Purity","Banishment","Death Ward","Locate Creature","Staggering Smite"], "5th":["Banishing Smite","Circle of Power","Destructive Wave","Dispel Evil and Good","Geas","Holy Weapon","Raise Dead"] },
  Ranger: { cantrips:[], "1st":["Alarm","Animal Friendship","Cure Wounds","Detect Magic","Detect Poison and Disease","Ensnaring Strike","Fog Cloud","Goodberry","Hail of Thorns","Hunter's Mark","Jump","Longstrider","Speak with Animals"], "2nd":["Animal Messenger","Barkskin","Beast Sense","Cordon of Arrows","Darkvision","Find Traps","Lesser Restoration","Locate Animals or Plants","Locate Object","Pass Without Trace","Protection from Poison","Silence","Spike Growth"], "3rd":["Conjure Animals","Conjure Barrage","Daylight","Lightning Arrow","Nondetection","Plant Growth","Protection from Energy","Speak with Plants","Water Breathing","Water Walk","Wind Wall"], "4th":["Conjure Woodland Beings","Freedom of Movement","Grasping Vine","Locate Creature","Stoneskin"], "5th":["Commune with Nature","Conjure Volley","Swift Quiver","Tree Stride"] },
  Sorcerer: { cantrips:["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","Thunderclap","True Strike"], "1st":["Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Jump","Mage Armor","Magic Missile","Ray of Sickness","Shield","Silent Image","Sleep","Thunderwave","Witch Bolt"], "2nd":["Alter Self","Blindness/Deafness","Blur","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Mirror Image","Misty Step","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"], "3rd":["Blink","Clairvoyance","Counterspell","Daylight","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Haste","Hypnotic Pattern","Lightning Bolt","Major Image","Protection from Energy","Sleet Storm","Slow","Stinking Cloud","Tongues","Water Breathing","Water Walk"], "4th":["Banishment","Blight","Confusion","Dimension Door","Dominate Beast","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Wall of Fire"], "5th":["Animate Objects","Cloudkill","Cone of Cold","Creation","Dominate Person","Hold Monster","Insect Plague","Seeming","Telekinesis","Teleportation Circle","Wall of Stone"], "6th":["Arcane Gate","Chain Lightning","Circle of Death","Disintegrate","Eyebite","Globe of Invulnerability","Mass Suggestion","Move Earth","Sunbeam","True Seeing"], "7th":["Delayed Blast Fireball","Etherealness","Finger of Death","Fire Storm","Plane Shift","Prismatic Spray","Reverse Gravity","Teleport"], "8th":["Dominate Monster","Earthquake","Incendiary Cloud","Power Word Stun","Sunburst"], "9th":["Gate","Meteor Swarm","Power Word Kill","Time Stop","Wish"] },
  Warlock: { cantrips:["Blade Ward","Chill Touch","Eldritch Blast","Friends","Mage Hand","Minor Illusion","Poison Spray","Prestidigitation","True Strike"], "1st":["Armor of Agathys","Arms of Hadar","Charm Person","Comprehend Languages","Expeditious Retreat","Hellish Rebuke","Illusory Script","Protection from Evil and Good","Unseen Servant","Witch Bolt"], "2nd":["Cloud of Daggers","Crown of Madness","Darkness","Enthrall","Hold Person","Invisibility","Mirror Image","Misty Step","Ray of Enfeeblement","Shatter","Spider Climb","Suggestion"], "3rd":["Counterspell","Dispel Magic","Fear","Fly","Gaseous Form","Hunger of Hadar","Hypnotic Pattern","Magic Circle","Major Image","Remove Curse","Tongues","Vampiric Touch"], "4th":["Banishment","Blight","Dimension Door","Hallucinatory Terrain"], "5th":["Contact Other Plane","Dream","Hold Monster","Scrying","Telekinesis"] },
  Wizard: { cantrips:["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","True Strike"], "1st":["Alarm","Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Find Familiar","Fog Cloud","Grease","Identify","Illusory Script","Jump","Longstrider","Mage Armor","Magic Missile","Protection from Evil and Good","Ray of Sickness","Shield","Silent Image","Sleep","Tasha's Hideous Laughter","Thunderwave","Unseen Servant","Witch Bolt"], "2nd":["Alter Self","Arcane Lock","Blindness/Deafness","Blur","Cloud of Daggers","Continual Flame","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enlarge/Reduce","Flaming Sphere","Gentle Repose","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Locate Object","Magic Mouth","Magic Weapon","Melf's Acid Arrow","Mirror Image","Misty Step","Nystul's Magic Aura","Phantasmal Force","Ray of Enfeeblement","Rope Trick","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"], "3rd":["Animate Dead","Bestow Curse","Blink","Clairvoyance","Counterspell","Dispel Magic","Fear","Feign Death","Fireball","Fly","Gaseous Form","Glyph of Warding","Haste","Hypnotic Pattern","Leomund's Tiny Hut","Lightning Bolt","Magic Circle","Major Image","Nondetection","Phantom Steed","Protection from Energy","Remove Curse","Sending","Sleet Storm","Slow","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing"], "4th":["Arcane Eye","Banishment","Blight","Confusion","Conjure Minor Elementals","Control Water","Dimension Door","Evard's Black Tentacles","Fabricate","Greater Invisibility","Hallucinatory Terrain","Ice Storm","Leomund's Secret Chest","Locate Creature","Mordenkainen's Faithful Hound","Mordenkainen's Private Sanctum","Otiluke's Resilient Sphere","Phantasmal Killer","Polymorph","Stone Shape","Stoneskin","Wall of Fire"], "5th":["Animate Objects","Bigby's Hand","Cloudkill","Cone of Cold","Conjure Elemental","Contact Other Plane","Creation","Dominate Person","Dream","Geas","Hold Monster","Legend Lore","Mislead","Modify Memory","Passwall","Planar Binding","Scrying","Seeming","Telekinesis","Teleportation Circle","Wall of Force","Wall of Stone"], "6th":["Arcane Gate","Chain Lightning","Circle of Death","Contingency","Create Undead","Disintegrate","Drawmij's Instant Summons","Eyebite","Flesh to Stone","Globe of Invulnerability","Guards and Wards","Magic Jar","Mass Suggestion","Move Earth","Otiluke's Freezing Sphere","Otto's Irresistible Dance","Programmed Illusion","Sunbeam","True Seeing","Wall of Ice"], "7th":["Delayed Blast Fireball","Etherealness","Finger of Death","Forcecage","Mirage Arcane","Mordenkainen's Magnificent Mansion","Mordenkainen's Sword","Plane Shift","Prismatic Spray","Project Image","Reverse Gravity","Sequester","Simulacrum","Symbol","Teleport"], "8th":["Antimagic Field","Antipathy/Sympathy","Clone","Control Weather","Demiplane","Dominate Monster","Feeblemind","Incendiary Cloud","Maze","Mind Blank","Power Word Stun","Sunburst","Telepathy","Trap the Soul"], "9th":["Astral Projection","Foresight","Gate","Imprisonment","Meteor Swarm","Power Word Kill","Prismatic Wall","Shapechange","Time Stop","True Polymorph","Weird","Wish"] },
};

const SKILLS_LIST = [
  { name: "Acrobatics", ability: "DEX" }, { name: "Animal Handling", ability: "WIS" },
  { name: "Arcana", ability: "INT" }, { name: "Athletics", ability: "STR" },
  { name: "Deception", ability: "CHA" }, { name: "History", ability: "INT" },
  { name: "Insight", ability: "WIS" }, { name: "Intimidation", ability: "CHA" },
  { name: "Investigation", ability: "INT" }, { name: "Medicine", ability: "WIS" },
  { name: "Nature", ability: "INT" }, { name: "Perception", ability: "WIS" },
  { name: "Performance", ability: "CHA" }, { name: "Persuasion", ability: "CHA" },
  { name: "Religion", ability: "INT" }, { name: "Sleight of Hand", ability: "DEX" },
  { name: "Stealth", ability: "DEX" }, { name: "Survival", ability: "WIS" },
];

const ALIGNMENTS = ["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil"];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const getMod = (score) => Math.floor((score - 10) / 2);
const getModStr = (score) => { const m = getMod(score); return (m >= 0 ? "+" : "") + m; };
const getProfBonus = (level) => Math.ceil(level / 4) + 1;

const getSpellSlots = (className, level) => {
  if (!className) return null;
  const cls = CLASSES_DATA.find(c => c.name === className);
  if (!cls || !cls.spellcasting) return null;
  if (cls.spellcastingType === "pact") return null; // handled separately
  const isHalf = ["Paladin","Ranger"].includes(className);
  const table = isHalf ? HALF_CASTER_SLOTS : FULL_CASTER_SLOTS;
  return table[level] || [0,0,0,0,0,0,0,0,0];
};

const getWarlockSlots = (level) => WARLOCK_SLOTS[level] || {count:0, spellLevel:0};

// ============================================================
// INITIAL STATE
// ============================================================
const initSkills = () => {
  const s = {};
  SKILLS_LIST.forEach(sk => { s[sk.name] = { proficient: false, expertise: false }; });
  return s;
};

const initSpellSlots = () => {
  const slots = {};
  for (let i = 1; i <= 9; i++) slots[i] = { max: 0, used: 0 };
  return slots;
};

const defaultChar = {
  // Identity
  characterName: "", playerName: "", xp: 0, level: 1,
  race: "", subrace: "", className: "", subclass: "", background: "", alignment: "",
  faith: "", age: "", gender: "", height: "", weight: "", hair: "", eyes: "", skin: "",
  // Ability Scores
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  // Saves proficiency
  saveProficiency: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
  // Skills
  skills: initSkills(),
  // Combat
  ac: 10, initiative: 0, speed: 30, maxHp: 0, currentHp: 0, tempHp: 0,
  hitDiceTotal: 0, hitDiceUsed: 0,
  deathSuccesses: [false, false, false], deathFailures: [false, false, false],
  // Weapons
  equippedWeapons: [],
  // Armor
  wornArmor: "", wornShield: false,
  // Spells
  spellcastingAbility: "", spellSlots: initSpellSlots(),
  warlockSlotsUsed: 0,
  knownSpells: [], preparedSpells: [],
  // Feats
  selectedFeats: [],
  // Equipment
  inventory: [], currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  // Biography
  personalityTraits: "", ideals: "", bonds: "", flaws: "",
  appearance: "", backstory: "", allies: "", enemies: "",
  lifestyle: "Modest", inspiration: false,
  // Languages
  languages: [], toolProficiencies: [], otherProficiencies: "",
  // Notes
  notes: "",
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function DnDCharacterSheet() {
  const [char, setChar] = useState(defaultChar);
  const [activeTab, setActiveTab] = useState("core");
  const [spellFilter, setSpellFilter] = useState({ level: "all", search: "" });

  const update = useCallback((field, value) => {
    setChar(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateNested = useCallback((field, key, value) => {
    setChar(prev => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
  }, []);

  // When race changes, auto-populate traits
  useEffect(() => {
    if (!char.race) return;
    const raceData = RACES_DATA.find(r => r.name === char.race);
    if (!raceData) return;
    const langs = [...raceData.languages];
    update("languages", langs);
    update("speed", raceData.speed);
    update("subrace", "");
  }, [char.race]);

  // When class changes, auto-populate saves and spellcasting ability
  useEffect(() => {
    if (!char.className) return;
    const cls = CLASSES_DATA.find(c => c.name === char.className);
    if (!cls) return;
    const newSaves = { str: false, dex: false, con: false, int: false, wis: false, cha: false };
    cls.savingThrows.forEach(st => {
      const key = st.toLowerCase().slice(0, 3);
      newSaves[key] = true;
    });
    update("saveProficiency", newSaves);
    update("spellcastingAbility", cls.spellcasting || "");
    update("subclass", "");
  }, [char.className]);

  // Auto-update spell slots when class or level changes
  useEffect(() => {
    if (!char.className || !char.level) return;
    const slots = getSpellSlots(char.className, char.level);
    if (slots) {
      const newSlots = {};
      for (let i = 1; i <= 9; i++) {
        const max = slots[i - 1] || 0;
        const prevUsed = char.spellSlots[i]?.used || 0;
        newSlots[i] = { max, used: Math.min(prevUsed, max) };
      }
      update("spellSlots", newSlots);
    }
  }, [char.className, char.level]);

  // Auto-populate background skills
  useEffect(() => {
    if (!char.background) return;
    const bg = BACKGROUNDS_DATA.find(b => b.name === char.background);
    if (!bg) return;
    const newSkills = { ...char.skills };
    bg.skillProf.forEach(sk => {
      if (newSkills[sk]) newSkills[sk] = { ...newSkills[sk], proficient: true };
    });
    update("skills", newSkills);
  }, [char.background]);

  const profBonus = getProfBonus(char.level || 1);
  const abilityMods = {
    STR: getMod(char.str), DEX: getMod(char.dex), CON: getMod(char.con),
    INT: getMod(char.int), WIS: getMod(char.wis), CHA: getMod(char.cha),
  };
  const modToAbilityKey = { STR: "str", DEX: "dex", CON: "con", INT: "int", WIS: "wis", CHA: "cha" };
  const saveValues = {
    str: abilityMods.STR + (char.saveProficiency.str ? profBonus : 0),
    dex: abilityMods.DEX + (char.saveProficiency.dex ? profBonus : 0),
    con: abilityMods.CON + (char.saveProficiency.con ? profBonus : 0),
    int: abilityMods.INT + (char.saveProficiency.int ? profBonus : 0),
    wis: abilityMods.WIS + (char.saveProficiency.wis ? profBonus : 0),
    cha: abilityMods.CHA + (char.saveProficiency.cha ? profBonus : 0),
  };
  const getSkillTotal = (skill) => {
    const mod = abilityMods[skill.ability];
    const { proficient, expertise } = char.skills[skill.name] || {};
    return mod + (expertise ? profBonus * 2 : proficient ? profBonus : 0);
  };
  const passivePerception = 10 + getSkillTotal({ name: "Perception", ability: "WIS" });

  const selectedRace = RACES_DATA.find(r => r.name === char.race);
  const selectedClass = CLASSES_DATA.find(c => c.name === char.className);
  const selectedBg = BACKGROUNDS_DATA.find(b => b.name === char.background);
  const isSpellcaster = selectedClass && selectedClass.spellcasting;
  const isWarlock = char.className === "Warlock";
  const warlockInfo = isWarlock ? getWarlockSlots(char.level) : null;

  const spellcastingMod = char.spellcastingAbility
    ? abilityMods[char.spellcastingAbility.toUpperCase().slice(0,3)]
    : 0;
  const spellSaveDC = 8 + profBonus + spellcastingMod;
  const spellAttackBonus = profBonus + spellcastingMod;

  const currentSpellList = char.className && SPELL_LISTS[char.className] ? SPELL_LISTS[char.className] : null;

  const getMaxHp = () => {
    if (!selectedClass) return char.maxHp;
    const dieMax = parseInt(selectedClass.hitDie.replace("1d", ""));
    const lvl = char.level || 1;
    return dieMax + (lvl - 1) * (Math.floor(dieMax / 2) + 1 + abilityMods.CON) + abilityMods.CON;
  };

  const tabs = [
    { id: "core", label: "⚔ Core" },
    { id: "spells", label: "✨ Spells" },
    { id: "features", label: "🛡 Features" },
    { id: "equipment", label: "🎒 Equipment" },
    { id: "biography", label: "📖 Biography" },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#0f0e17", minHeight: "100vh", color: "#e8dcc8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        * { box-sizing: border-box; }
        .sheet-font { font-family: 'Crimson Text', Georgia, serif; }
        .header-font { font-family: 'Cinzel', Georgia, serif; }
        .stat-box { background: #1a1625; border: 1px solid #4a3728; border-radius: 6px; padding: 8px; text-align: center; }
        .stat-box:hover { border-color: #c9a84c; }
        .parchment { background: #f5f0e3; color: #2a1f14; border-radius: 6px; }
        .tab-btn { background: transparent; border: none; cursor: pointer; padding: 10px 16px; color: #8a7560; font-family: 'Cinzel', serif; font-size: 13px; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
        .tab-btn:hover { color: #c9a84c; }
        .tab-btn.active { color: #c9a84c; border-bottom-color: #c9a84c; }
        .section-title { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2px; color: #8b0000; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #3a2a1a; }
        .field-input { background: #1a1625; border: 1px solid #3a2a1a; border-radius: 4px; color: #e8dcc8; padding: 6px 8px; width: 100%; font-family: 'Crimson Text', serif; font-size: 14px; transition: border-color 0.2s; }
        .field-input:focus { outline: none; border-color: #c9a84c; }
        .field-input option { background: #1a1625; }
        .field-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #8a7560; margin-bottom: 3px; font-family: 'Cinzel', serif; }
        .skill-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; cursor: pointer; }
        .skill-row:hover { color: #c9a84c; }
        .prof-circle { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #4a3728; background: transparent; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .prof-circle.filled { background: #8b0000; border-color: #8b0000; }
        .prof-circle.expertise { background: #c9a84c; border-color: #c9a84c; }
        .spell-slot-bubble { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #8b0000; background: transparent; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .spell-slot-bubble.used { background: #3a0000; border-color: #3a0000; }
        .spell-slot-bubble:hover { border-color: #c9a84c; }
        .card { background: #16121e; border: 1px solid #2a2030; border-radius: 8px; padding: 16px; }
        .hp-bar-outer { height: 8px; background: #2a1a1a; border-radius: 4px; overflow: hidden; }
        .gold-btn { background: linear-gradient(135deg, #8b6914, #c9a84c); border: none; color: #0f0e17; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 1px; font-weight: 700; }
        .gold-btn:hover { opacity: 0.9; }
        .danger-btn { background: #3a0000; border: 1px solid #8b0000; color: #ff6b6b; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .weapon-row { background: #1a1625; border: 1px solid #2a2030; border-radius: 6px; padding: 10px 12px; display: grid; grid-template-columns: 2fr 1fr 1fr 2fr auto; gap: 8px; align-items: center; margin-bottom: 6px; }
        .death-save-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #555; background: transparent; cursor: pointer; transition: all 0.15s; }
        .death-save-circle.success { background: #1a6b1a; border-color: #2a9b2a; }
        .death-save-circle.fail { background: #6b1a1a; border-color: #9b2a2a; }
        .trait-textarea { background: #1a1625; border: 1px solid #3a2a1a; border-radius: 4px; color: #e8dcc8; padding: 8px; width: 100%; font-family: 'Crimson Text', serif; font-size: 14px; resize: vertical; min-height: 80px; }
        .trait-textarea:focus { outline: none; border-color: #c9a84c; }
        .spell-item { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
        .spell-item:hover { background: #1a1625; }
        .spell-item.known { color: #c9a84c; }
        .inventory-row { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
        @media print {
          .no-print { display: none !important; }
          .tab-content { display: block !important; }
          body { background: white; color: black; }
        }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg, #0f0e17 0%, #1a0a0a 100%)", borderBottom: "2px solid #8b0000", padding: "20px 24px 12px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: 28, fontWeight: 900, color: "#c9a84c", letterSpacing: 3, lineHeight: 1 }}>DUNGEONS & DRAGONS</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: 13, color: "#8b0000", letterSpacing: 4, marginTop: 2 }}>5TH EDITION CHARACTER RECORD</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div className="field-label" style={{ color: "#c9a84c" }}>Inspiration</div>
                <button onClick={() => update("inspiration", !char.inspiration)} style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${char.inspiration ? "#c9a84c" : "#3a2a1a"}`, background: char.inspiration ? "#8b6914" : "transparent", cursor: "pointer", fontSize: 18, color: "#c9a84c" }}>
                  {char.inspiration ? "★" : "☆"}
                </button>
              </div>
              <div style={{ textAlign: "center" }}>
                <div className="field-label">Prof Bonus</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: 22, color: "#c9a84c", fontWeight: 700 }}>+{profBonus}</div>
              </div>
              <button className="gold-btn no-print" onClick={() => window.print()} style={{ marginLeft: 8 }}>🖨 Print</button>
            </div>
          </div>

          {/* Character Identity Row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <div className="field-label">Character Name</div>
              <input className="field-input" value={char.characterName} onChange={e => update("characterName", e.target.value)} placeholder="Name your hero..." style={{ fontSize: 18, fontFamily: "Cinzel, serif", color: "#c9a84c" }} />
            </div>
            <div>
              <div className="field-label">Class</div>
              <select className="field-input" value={char.className} onChange={e => update("className", e.target.value)}>
                <option value="">Choose...</option>
                {CLASSES_DATA.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label">Subclass</div>
              <select className="field-input" value={char.subclass} onChange={e => update("subclass", e.target.value)} disabled={!char.className}>
                <option value="">—</option>
                {char.className && SUBCLASSES_DATA[char.className]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label">Level</div>
              <input className="field-input" type="number" min={1} max={20} value={char.level} onChange={e => update("level", parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <div className="field-label">Race</div>
              <select className="field-input" value={char.race} onChange={e => update("race", e.target.value)}>
                <option value="">Choose...</option>
                {RACES_DATA.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label">Subrace</div>
              <select className="field-input" value={char.subrace} onChange={e => update("subrace", e.target.value)} disabled={!char.race || !selectedRace?.subraces?.length}>
                <option value="">—</option>
                {selectedRace?.subraces?.map(sr => <option key={sr.name} value={sr.name}>{sr.name}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label">Background</div>
              <select className="field-input" value={char.background} onChange={e => update("background", e.target.value)}>
                <option value="">Choose...</option>
                {BACKGROUNDS_DATA.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <div><div className="field-label">Player Name</div><input className="field-input" value={char.playerName} onChange={e => update("playerName", e.target.value)} /></div>
            <div><div className="field-label">Alignment</div>
              <select className="field-input" value={char.alignment} onChange={e => update("alignment", e.target.value)}>
                <option value="">—</option>
                {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div><div className="field-label">Experience Points</div><input className="field-input" type="number" min={0} value={char.xp} onChange={e => update("xp", parseInt(e.target.value) || 0)} /></div>
            <div><div className="field-label">Faith / Deity</div><input className="field-input" value={char.faith} onChange={e => update("faith", e.target.value)} /></div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="no-print" style={{ background: "#16121e", borderBottom: "1px solid #2a2030", overflowX: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex" }}>
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

        {/* ===== CORE TAB ===== */}
        {activeTab === "core" && (
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 220px", gap: 16 }}>

            {/* LEFT: Ability Scores */}
            <div>
              <div className="section-title">Ability Scores</div>
              {[
                { label: "Strength", key: "str", abbr: "STR" },
                { label: "Dexterity", key: "dex", abbr: "DEX" },
                { label: "Constitution", key: "con", abbr: "CON" },
                { label: "Intelligence", key: "int", abbr: "INT" },
                { label: "Wisdom", key: "wis", abbr: "WIS" },
                { label: "Charisma", key: "cha", abbr: "CHA" },
              ].map(ab => (
                <div key={ab.key} className="stat-box" style={{ marginBottom: 8, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 8 }}>
                  <div>
                    <div className="field-label" style={{ marginBottom: 4 }}>{ab.label}</div>
                    <input className="field-input" type="number" min={1} max={30} value={char[ab.key]}
                      onChange={e => update(ab.key, parseInt(e.target.value) || 10)}
                      style={{ fontSize: 20, textAlign: "center", fontWeight: 700, width: "100%" }} />
                  </div>
                  <div style={{ textAlign: "center", minWidth: 48 }}>
                    <div className="field-label">Mod</div>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: 24, fontWeight: 700, color: "#c9a84c" }}>
                      {getModStr(char[ab.key])}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 16 }}>
                <div className="section-title">Saving Throws</div>
                {[
                  { label: "Strength", short: "STR", key: "str" },
                  { label: "Dexterity", short: "DEX", key: "dex" },
                  { label: "Constitution", short: "CON", key: "con" },
                  { label: "Intelligence", short: "INT", key: "int" },
                  { label: "Wisdom", short: "WIS", key: "wis" },
                  { label: "Charisma", short: "CHA", key: "cha" },
                ].map(sv => (
                  <div key={sv.key} className="skill-row" onClick={() => updateNested("saveProficiency", sv.key, !char.saveProficiency[sv.key])}>
                    <div className={`prof-circle ${char.saveProficiency[sv.key] ? "filled" : ""}`} />
                    <div style={{ fontSize: 13, flex: 1 }}>{sv.label}</div>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: 13, color: char.saveProficiency[sv.key] ? "#c9a84c" : "#e8dcc8", minWidth: 30, textAlign: "right" }}>
                      {(saveValues[sv.key] >= 0 ? "+" : "") + saveValues[sv.key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER: Combat + Skills */}
            <div>
              {/* Combat Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Armor Class", value: char.ac, field: "ac", editable: true },
                  { label: "Initiative", value: (abilityMods.DEX >= 0 ? "+" : "") + abilityMods.DEX, field: null, editable: false },
                  { label: "Speed", value: char.speed + " ft", field: "speed", editable: true },
                  { label: "Hit Dice", value: `${char.level}${selectedClass?.hitDie || "d?"}`, field: null, editable: false },
                  { label: "Passive Perc.", value: passivePerception, field: null, editable: false },
                ].map(item => (
                  <div key={item.label} className="stat-box" style={{ padding: 12 }}>
                    <div className="field-label">{item.label}</div>
                    {item.editable
                      ? <input className="field-input" type="number" value={item.field === "speed" ? char.speed : char.ac} onChange={e => update(item.field, parseInt(e.target.value) || 0)} style={{ textAlign: "center", fontFamily: "Cinzel, serif", fontSize: 22, fontWeight: 700 }} />
                      : <div style={{ fontFamily: "Cinzel, serif", fontSize: 22, fontWeight: 700, color: "#c9a84c", textAlign: "center" }}>{item.value}</div>
                    }
                  </div>
                ))}
              </div>

              {/* HP Section */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title">Hit Points</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <div className="field-label">Maximum HP</div>
                    <input className="field-input" type="number" value={char.maxHp} onChange={e => update("maxHp", parseInt(e.target.value) || 0)}
                      style={{ fontSize: 20, textAlign: "center", fontFamily: "Cinzel, serif" }} />
                    <div style={{ fontSize: 10, color: "#8a7560", marginTop: 3 }}>Auto: {getMaxHp()} hp</div>
                  </div>
                  <div>
                    <div className="field-label">Current HP</div>
                    <input className="field-input" type="number" value={char.currentHp} onChange={e => update("currentHp", parseInt(e.target.value) || 0)}
                      style={{ fontSize: 20, textAlign: "center", fontFamily: "Cinzel, serif", color: char.currentHp <= 0 ? "#ff4444" : char.currentHp <= char.maxHp * 0.25 ? "#ff8c00" : "#4ade80" }} />
                  </div>
                  <div>
                    <div className="field-label">Temp HP</div>
                    <input className="field-input" type="number" value={char.tempHp} onChange={e => update("tempHp", parseInt(e.target.value) || 0)}
                      style={{ fontSize: 20, textAlign: "center", fontFamily: "Cinzel, serif", color: "#60a5fa" }} />
                  </div>
                </div>
                {char.maxHp > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div className="hp-bar-outer">
                      <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, (char.currentHp / char.maxHp) * 100))}%`, background: char.currentHp <= char.maxHp * 0.25 ? "#8b0000" : char.currentHp <= char.maxHp * 0.5 ? "#b8520a" : "#1a6b1a", transition: "width 0.3s, background 0.3s", borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#8a7560", marginTop: 3, textAlign: "right" }}>
                      {char.currentHp}/{char.maxHp} HP ({Math.round((char.currentHp / char.maxHp) * 100)}%)
                    </div>
                  </div>
                )}

                {/* Death Saves */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
                  {[{ label: "Death Save Successes", key: "deathSuccesses", successColor: true }, { label: "Death Save Failures", key: "deathFailures", successColor: false }].map(ds => (
                    <div key={ds.key}>
                      <div className="field-label">{ds.label}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        {[0,1,2].map(i => (
                          <button key={i} className={`death-save-circle ${char[ds.key][i] ? (ds.successColor ? "success" : "fail") : ""}`}
                            onClick={() => { const arr = [...char[ds.key]]; arr[i] = !arr[i]; update(ds.key, arr); }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attacks */}
              <div className="card">
                <div className="section-title">Attacks & Weapons</div>
                {char.equippedWeapons.length === 0 && (
                  <div style={{ color: "#8a7560", fontSize: 13, fontStyle: "italic", marginBottom: 10 }}>No weapons equipped. Add from Equipment tab.</div>
                )}
                {char.equippedWeapons.map((w, i) => {
                  const wData = ALL_WEAPONS.find(wp => wp.name === w.name);
                  const isFinesse = wData?.props?.includes("Finesse");
                  const attrMod = isFinesse ? Math.max(abilityMods.STR, abilityMods.DEX) : (wData?.cat?.includes("Ranged") ? abilityMods.DEX : abilityMods.STR);
                  const toHit = attrMod + profBonus + (w.magicBonus || 0);
                  return (
                    <div key={i} className="weapon-row">
                      <div style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}>{w.name}{w.magicBonus > 0 ? ` (+${w.magicBonus})` : ""}</div>
                      <div style={{ color: "#8a7560", fontSize: 12 }}>{wData?.range || "melee"}</div>
                      <div style={{ color: "#c9a84c", fontFamily: "Cinzel, serif" }}>{(toHit >= 0 ? "+" : "") + toHit}</div>
                      <div style={{ fontSize: 12 }}>{wData?.damage || "—"} + {attrMod >= 0 ? "+" + attrMod : attrMod} {wData?.type}</div>
                      <button className="danger-btn" onClick={() => { const arr = char.equippedWeapons.filter((_,j) => j !== i); update("equippedWeapons", arr); }}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Skills */}
            <div>
              <div className="section-title">Skills</div>
              <div style={{ fontSize: 10, color: "#8a7560", marginBottom: 8 }}>Click to toggle proficiency. Double-click for expertise.</div>
              {SKILLS_LIST.map(skill => {
                const { proficient, expertise } = char.skills[skill.name] || {};
                const total = getSkillTotal(skill);
                return (
                  <div key={skill.name} className="skill-row"
                    onClick={() => {
                      const cur = char.skills[skill.name] || { proficient: false, expertise: false };
                      if (cur.expertise) {
                        updateNested("skills", skill.name, { proficient: false, expertise: false });
                      } else if (cur.proficient) {
                        updateNested("skills", skill.name, { proficient: true, expertise: true });
                      } else {
                        updateNested("skills", skill.name, { proficient: true, expertise: false });
                      }
                    }}>
                    <div className={`prof-circle ${expertise ? "expertise" : proficient ? "filled" : ""}`} style={{ width: 12, height: 12 }} />
                    <div style={{ flex: 1, fontSize: 13 }}>
                      {skill.name} <span style={{ color: "#8a7560", fontSize: 11 }}>({skill.ability})</span>
                    </div>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: 13, color: proficient ? "#c9a84c" : "#e8dcc8", minWidth: 28, textAlign: "right" }}>
                      {total >= 0 ? "+" : ""}{total}
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: 16 }}>
                <div className="section-title">Senses</div>
                <div style={{ fontSize: 13, color: "#8a7560" }}>Passive Perception: <span style={{ color: "#c9a84c" }}>{passivePerception}</span></div>
                <div style={{ fontSize: 12, marginTop: 6, color: "#8a7560" }}>
                  {selectedRace?.traits?.includes("Darkvision") || selectedRace?.traits?.includes("Superior Darkvision") ? "• Darkvision 60 ft" : ""}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div className="section-title">Languages</div>
                {(char.languages || []).map((lang, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#8a7560" }}>• {lang}</div>
                ))}
                {!char.languages?.length && <div style={{ fontSize: 12, color: "#4a3728", fontStyle: "italic" }}>Select a race</div>}
              </div>

              <div style={{ marginTop: 16 }}>
                <div className="section-title">Armor & Weapon Prof.</div>
                {selectedClass && (
                  <>
                    {selectedClass.armorProf.map(p => <div key={p} style={{ fontSize: 12, color: "#8a7560" }}>• {p}</div>)}
                    {selectedClass.weaponProf.map(p => <div key={p} style={{ fontSize: 12, color: "#8a7560" }}>• {p}</div>)}
                  </>
                )}
                <div style={{ marginTop: 8 }}>
                  <div className="field-label">Other Proficiencies</div>
                  <textarea className="trait-textarea" style={{ minHeight: 60 }} value={char.otherProficiencies} onChange={e => update("otherProficiencies", e.target.value)} placeholder="Tools, instruments, etc." />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SPELLS TAB ===== */}
        {activeTab === "spells" && (
          <div>
            {!isSpellcaster && !isWarlock && (
              <div style={{ textAlign: "center", padding: 60, color: "#8a7560" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: 20, marginBottom: 12 }}>⚔ No Spellcasting</div>
                <div>{char.className || "No class selected"} {char.className ? "does not have spellcasting abilities." : "— select a class first."}</div>
              </div>
            )}
            {(isSpellcaster || isWarlock) && (
              <>
                {/* Spellcasting Header */}
                <div className="card" style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div className="field-label">Spellcasting Ability</div>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: 22, color: "#c9a84c" }}>{char.spellcastingAbility || "—"}</div>
                  </div>
                  <div>
                    <div className="field-label">Spell Save DC</div>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: 28, color: "#c9a84c", fontWeight: 700 }}>{spellSaveDC}</div>
                    <div style={{ fontSize: 10, color: "#8a7560" }}>8 + {profBonus} (prof) + {spellcastingMod} ({char.spellcastingAbility})</div>
                  </div>
                  <div>
                    <div className="field-label">Spell Attack Bonus</div>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: 28, color: "#c9a84c", fontWeight: 700 }}>+{spellAttackBonus}</div>
                    <div style={{ fontSize: 10, color: "#8a7560" }}>{profBonus} (prof) + {spellcastingMod} ({char.spellcastingAbility})</div>
                  </div>
                  <div>
                    <div className="field-label">Class / Level</div>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: 16, color: "#e8dcc8" }}>{char.className} {char.level}</div>
                    <div style={{ fontSize: 11, color: "#8a7560" }}>{isWarlock ? "Pact Magic" : "Full/Half Caster"}</div>
                  </div>
                </div>

                {/* Warlock Pact Magic */}
                {isWarlock && warlockInfo && (
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div className="section-title">Pact Magic Slots — {warlockInfo.spellLevel === 1 ? "1st" : warlockInfo.spellLevel === 2 ? "2nd" : warlockInfo.spellLevel === 3 ? "3rd" : warlockInfo.spellLevel + "th"} Level</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {Array.from({ length: warlockInfo.count }).map((_, i) => (
                        <button key={i} className={`spell-slot-bubble ${i < char.warlockSlotsUsed ? "used" : ""}`}
                          onClick={() => update("warlockSlotsUsed", i < char.warlockSlotsUsed ? i : i + 1)}
                          style={{ width: 32, height: 32 }}>
                          {i < char.warlockSlotsUsed ? "✕" : ""}
                        </button>
                      ))}
                      <button className="gold-btn" style={{ marginLeft: 8, padding: "4px 10px", fontSize: 11 }} onClick={() => update("warlockSlotsUsed", 0)}>Long Rest</button>
                    </div>
                  </div>
                )}

                {/* Regular Spell Slots */}
                {!isWarlock && (
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div className="section-title" style={{ marginBottom: 0 }}>Spell Slots</div>
                      <button className="gold-btn" style={{ padding: "4px 12px", fontSize: 11 }} onClick={() => {
                        const reset = { ...char.spellSlots };
                        for (let i = 1; i <= 9; i++) reset[i] = { ...reset[i], used: 0 };
                        update("spellSlots", reset);
                      }}>Long Rest (Restore All)</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                      {[1,2,3,4,5,6,7,8,9].map(lvl => {
                        const slotData = char.spellSlots[lvl] || { max: 0, used: 0 };
                        if (slotData.max === 0) return null;
                        const ordinals = ["","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"];
                        return (
                          <div key={lvl} style={{ minWidth: 90 }}>
                            <div className="field-label" style={{ marginBottom: 6 }}>{ordinals[lvl]} Level</div>
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                              {Array.from({ length: slotData.max }).map((_, i) => (
                                <button key={i} className={`spell-slot-bubble ${i < slotData.used ? "used" : ""}`}
                                  onClick={() => {
                                    const newUsed = i < slotData.used ? i : i + 1;
                                    updateNested("spellSlots", lvl, { ...slotData, used: newUsed });
                                  }}>
                                  {i < slotData.used ? "✕" : ""}
                                </button>
                              ))}
                            </div>
                            <div style={{ fontSize: 10, color: "#8a7560", marginTop: 4 }}>
                              {slotData.max - slotData.used}/{slotData.max} remaining
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Spell List */}
                {currentSpellList && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Left: Cantrips + Lower Levels */}
                    <div>
                      {/* Search */}
                      <div style={{ marginBottom: 12 }}>
                        <input className="field-input" placeholder="🔍 Search spells..." value={spellFilter.search} onChange={e => setSpellFilter(p => ({ ...p, search: e.target.value }))} />
                      </div>

                      {["cantrips","1st","2nd","3rd","4th","5th"].map(lvl => {
                        const spells = currentSpellList[lvl] || [];
                        const filtered = spells.filter(s => !spellFilter.search || s.toLowerCase().includes(spellFilter.search.toLowerCase()));
                        if (!filtered.length) return null;
                        const ordinals = { cantrips: "Cantrips", "1st": "1st Level", "2nd": "2nd Level", "3rd": "3rd Level", "4th": "4th Level", "5th": "5th Level" };
                        return (
                          <div key={lvl} className="card" style={{ marginBottom: 12 }}>
                            <div className="section-title">{ordinals[lvl]}</div>
                            {filtered.map(spell => {
                              const isKnown = char.knownSpells.includes(spell);
                              return (
                                <div key={spell} className={`spell-item ${isKnown ? "known" : ""}`}
                                  onClick={() => {
                                    const arr = isKnown ? char.knownSpells.filter(s => s !== spell) : [...char.knownSpells, spell];
                                    update("knownSpells", arr);
                                  }}>
                                  <span style={{ fontSize: 12 }}>{isKnown ? "★" : "☆"}</span>
                                  <span style={{ fontSize: 13 }}>{spell}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      {["6th","7th","8th","9th"].map(lvl => {
                        const spells = currentSpellList[lvl] || [];
                        const filtered = spells.filter(s => !spellFilter.search || s.toLowerCase().includes(spellFilter.search.toLowerCase()));
                        if (!filtered.length) return null;
                        const ordinals = { "6th": "6th Level", "7th": "7th Level", "8th": "8th Level", "9th": "9th Level" };
                        return (
                          <div key={lvl} className="card" style={{ marginBottom: 12 }}>
                            <div className="section-title">{ordinals[lvl]}</div>
                            {filtered.map(spell => {
                              const isKnown = char.knownSpells.includes(spell);
                              return (
                                <div key={spell} className={`spell-item ${isKnown ? "known" : ""}`}
                                  onClick={() => {
                                    const arr = isKnown ? char.knownSpells.filter(s => s !== spell) : [...char.knownSpells, spell];
                                    update("knownSpells", arr);
                                  }}>
                                  <span style={{ fontSize: 12 }}>{isKnown ? "★" : "☆"}</span>
                                  <span style={{ fontSize: 13 }}>{spell}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}

                      {/* Known Spells Summary */}
                      {char.knownSpells.length > 0 && (
                        <div className="card">
                          <div className="section-title">Known/Prepared ({char.knownSpells.length})</div>
                          {char.knownSpells.map(s => (
                            <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", fontSize: 13 }}>
                              <span style={{ color: "#c9a84c" }}>★ {s}</span>
                              <button className="danger-btn" style={{ padding: "1px 6px" }} onClick={() => update("knownSpells", char.knownSpells.filter(x => x !== s))}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== FEATURES TAB ===== */}
        {activeTab === "features" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Class Features */}
            <div>
              {selectedClass && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="section-title">Class Features — {char.className} {char.level}</div>
                  {selectedClass.features.filter(f => f.level <= (char.level || 1)).map((f, i) => (
                    <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #2a2030" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontFamily: "Cinzel, serif", fontSize: 13, color: "#c9a84c" }}>{f.name}</div>
                        <div style={{ fontSize: 10, color: "#8a7560" }}>Level {f.level}</div>
                      </div>
                    </div>
                  ))}
                  {selectedClass.features.filter(f => f.level > (char.level || 1)).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div className="field-label" style={{ color: "#4a3728", marginBottom: 6 }}>Upcoming Features</div>
                      {selectedClass.features.filter(f => f.level > (char.level || 1)).map((f, i) => (
                        <div key={i} style={{ color: "#4a3728", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: "#8a7560" }}>Lvl {f.level}:</span> {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subclass Features */}
              {char.subclass && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="section-title">Subclass — {char.subclass}</div>
                  <div style={{ color: "#8a7560", fontSize: 13 }}>Subclass features are available at specific levels. Consult your Player's Handbook for full details on {char.subclass}.</div>
                </div>
              )}

              {/* Racial Traits */}
              {selectedRace && (
                <div className="card">
                  <div className="section-title">Racial Traits — {char.race}{char.subrace ? ` (${char.subrace})` : ""}</div>
                  <div style={{ marginBottom: 8 }}>
                    <div className="field-label">Ability Score Increases</div>
                    {Object.entries(selectedRace.asi).map(([stat, val]) => (
                      <div key={stat} style={{ fontSize: 13, color: "#c9a84c" }}>• {stat}: +{val}</div>
                    ))}
                    {char.subrace && (() => {
                      const sr = selectedRace.subraces.find(s => s.name === char.subrace);
                      return sr ? Object.entries(sr.asi).map(([stat, val]) => (
                        <div key={stat} style={{ fontSize: 13, color: "#c9a84c" }}>• {stat}: +{val} (subrace)</div>
                      )) : null;
                    })()}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div className="field-label">Speed</div>
                    <div style={{ fontSize: 13, color: "#e8dcc8" }}>{selectedRace.speed} ft</div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div className="field-label">Traits</div>
                    {selectedRace.traits.map(t => <div key={t} style={{ fontSize: 13, color: "#e8dcc8" }}>• {t}</div>)}
                    {char.subrace && (() => {
                      const sr = selectedRace.subraces.find(s => s.name === char.subrace);
                      return sr?.traits?.map(t => <div key={t} style={{ fontSize: 13, color: "#c9a84c" }}>• {t} (subrace)</div>);
                    })()}
                  </div>
                  <div>
                    <div className="field-label">Languages</div>
                    {selectedRace.languages.map(l => <div key={l} style={{ fontSize: 13, color: "#e8dcc8" }}>• {l}</div>)}
                  </div>
                </div>
              )}
            </div>

            {/* Feats */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title">Feats</div>
                <div style={{ marginBottom: 10 }}>
                  <select className="field-input" onChange={e => {
                    if (!e.target.value) return;
                    if (!char.selectedFeats.includes(e.target.value)) {
                      update("selectedFeats", [...char.selectedFeats, e.target.value]);
                    }
                    e.target.value = "";
                  }}>
                    <option value="">+ Add a feat...</option>
                    {FEATS_DATA.filter(f => !char.selectedFeats.includes(f.name)).map(f => (
                      <option key={f.name} value={f.name}>{f.name}{f.prereq ? ` (Req: ${f.prereq})` : ""}</option>
                    ))}
                  </select>
                </div>
                {char.selectedFeats.length === 0 && (
                  <div style={{ color: "#8a7560", fontSize: 13, fontStyle: "italic" }}>No feats selected.</div>
                )}
                {char.selectedFeats.map(featName => {
                  const feat = FEATS_DATA.find(f => f.name === featName);
                  return (
                    <div key={featName} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #2a2030" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontFamily: "Cinzel, serif", fontSize: 14, color: "#c9a84c" }}>{featName}</div>
                        <button className="danger-btn" onClick={() => update("selectedFeats", char.selectedFeats.filter(f => f !== featName))}>✕</button>
                      </div>
                      {feat?.prereq && <div style={{ fontSize: 11, color: "#8a7560", marginTop: 2 }}>Requires: {feat.prereq}</div>}
                      {feat?.benefits.map((b, i) => <div key={i} style={{ fontSize: 12, color: "#e8dcc8", marginTop: 4 }}>• {b}</div>)}
                    </div>
                  );
                })}
              </div>

              {/* Background Feature */}
              {selectedBg && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="section-title">Background Feature — {char.background}</div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: 14, color: "#c9a84c", marginBottom: 6 }}>{selectedBg.feature}</div>
                  <div style={{ marginBottom: 8 }}>
                    <div className="field-label">Skill Proficiencies</div>
                    {selectedBg.skillProf.map(s => <div key={s} style={{ fontSize: 13, color: "#c9a84c" }}>• {s}</div>)}
                  </div>
                  {selectedBg.toolProf?.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div className="field-label">Tool Proficiencies</div>
                      {selectedBg.toolProf.map(t => <div key={t} style={{ fontSize: 13, color: "#e8dcc8" }}>• {t}</div>)}
                    </div>
                  )}
                  {selectedBg.languages > 0 && (
                    <div style={{ fontSize: 13, color: "#8a7560" }}>• {selectedBg.languages} additional language{selectedBg.languages > 1 ? "s" : ""}</div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="card">
                <div className="section-title">Notes & Additional Features</div>
                <textarea className="trait-textarea" style={{ minHeight: 160 }} value={char.notes} onChange={e => update("notes", e.target.value)} placeholder="Class features, racial abilities, special rules..." />
              </div>
            </div>
          </div>
        )}

        {/* ===== EQUIPMENT TAB ===== */}
        {activeTab === "equipment" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Weapons */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title">Weapons</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginBottom: 10 }}>
                  <select id="weaponSelect" className="field-input">
                    <option value="">Select weapon to add...</option>
                    {["Simple Melee","Simple Ranged","Martial Melee","Martial Ranged"].map(cat => (
                      <optgroup key={cat} label={cat}>
                        {ALL_WEAPONS.filter(w => w.cat === cat).map(w => (
                          <option key={w.name} value={w.name}>{w.name} ({w.damage} {w.type})</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <input id="magicBonusInput" className="field-input" type="number" min={0} max={3} defaultValue={0} placeholder="+magic" style={{ width: 70 }} />
                  <button className="gold-btn" onClick={() => {
                    const sel = document.getElementById("weaponSelect").value;
                    const bonus = parseInt(document.getElementById("magicBonusInput").value) || 0;
                    if (!sel) return;
                    update("equippedWeapons", [...char.equippedWeapons, { name: sel, magicBonus: bonus }]);
                    document.getElementById("weaponSelect").value = "";
                  }}>Add</button>
                </div>
                {char.equippedWeapons.length === 0 && <div style={{ color: "#8a7560", fontSize: 13, fontStyle: "italic" }}>No weapons equipped.</div>}
                {char.equippedWeapons.map((w, i) => {
                  const wData = ALL_WEAPONS.find(wp => wp.name === w.name);
                  return (
                    <div key={i} style={{ background: "#1a1625", border: "1px solid #2a2030", borderRadius: 6, padding: "10px 12px", marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontFamily: "Cinzel, serif", fontSize: 14, color: "#c9a84c" }}>{w.name}{w.magicBonus > 0 ? ` +${w.magicBonus}` : ""}</div>
                        <button className="danger-btn" onClick={() => update("equippedWeapons", char.equippedWeapons.filter((_, j) => j !== i))}>Remove</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6, fontSize: 12, color: "#8a7560" }}>
                        <div><span style={{ color: "#e8dcc8" }}>Damage:</span> {wData?.damage} {wData?.type}</div>
                        <div><span style={{ color: "#e8dcc8" }}>Range:</span> {wData?.range}</div>
                        <div><span style={{ color: "#e8dcc8" }}>Cat:</span> {wData?.cat}</div>
                      </div>
                      <div style={{ marginTop: 4, fontSize: 11, color: "#8a7560" }}>{wData?.props?.join(", ")}</div>
                    </div>
                  );
                })}
              </div>

              {/* Armor */}
              <div className="card">
                <div className="section-title">Armor</div>
                <div style={{ marginBottom: 10 }}>
                  <div className="field-label">Worn Armor</div>
                  <select className="field-input" value={char.wornArmor} onChange={e => update("wornArmor", e.target.value)}>
                    <option value="">None (Unarmored)</option>
                    {["Light","Medium","Heavy","Shield"].map(cat => (
                      <optgroup key={cat} label={cat + " Armor"}>
                        {ALL_ARMOR.filter(a => a.cat === cat).map(a => (
                          <option key={a.name} value={a.name}>{a.name} (AC {a.ac}){a.strReq ? ` [${a.strReq}]` : ""}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {char.wornArmor && (() => {
                  const armor = ALL_ARMOR.find(a => a.name === char.wornArmor);
                  return armor ? (
                    <div style={{ background: "#1a1625", borderRadius: 6, padding: "8px 12px", fontSize: 13 }}>
                      <div style={{ color: "#c9a84c", fontFamily: "Cinzel, serif" }}>{armor.name}</div>
                      <div style={{ color: "#8a7560" }}>AC: {armor.ac} | Weight: {armor.weight}</div>
                      {armor.stealthDisadv && <div style={{ color: "#ff6b6b", fontSize: 11 }}>⚠ Stealth Disadvantage</div>}
                      {armor.strReq && <div style={{ color: "#ff8c00", fontSize: 11 }}>Requires {armor.strReq}</div>}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Inventory */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title">Currency</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {[["cp","Copper"],["sp","Silver"],["ep","Electrum"],["gp","Gold"],["pp","Platinum"]].map(([key, label]) => (
                    <div key={key}>
                      <div className="field-label">{label}</div>
                      <input className="field-input" type="number" min={0} value={char.currency[key]} onChange={e => updateNested("currency", key, parseInt(e.target.value) || 0)} style={{ textAlign: "center" }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#8a7560", textAlign: "right" }}>
                  Total GP equivalent: {(char.currency.pp * 10 + char.currency.gp + char.currency.ep * 0.5 + char.currency.sp * 0.1 + char.currency.cp * 0.01).toFixed(2)} gp
                </div>
              </div>

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div className="section-title" style={{ marginBottom: 0 }}>Adventuring Gear</div>
                  <button className="gold-btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => update("inventory", [...char.inventory, { name: "", qty: 1, weight: 0 }])}>+ Add Item</button>
                </div>
                {char.inventory.length === 0 && <div style={{ color: "#8a7560", fontSize: 13, fontStyle: "italic" }}>No items in inventory.</div>}
                {char.inventory.map((item, i) => (
                  <div key={i} className="inventory-row">
                    <input className="field-input" style={{ flex: 3 }} value={item.name} placeholder="Item name..."
                      onChange={e => { const arr = [...char.inventory]; arr[i] = { ...arr[i], name: e.target.value }; update("inventory", arr); }} />
                    <input className="field-input" style={{ width: 60 }} type="number" min={1} value={item.qty} placeholder="Qty"
                      onChange={e => { const arr = [...char.inventory]; arr[i] = { ...arr[i], qty: parseInt(e.target.value) || 1 }; update("inventory", arr); }} />
                    <input className="field-input" style={{ width: 70 }} type="number" min={0} step={0.5} value={item.weight} placeholder="lb"
                      onChange={e => { const arr = [...char.inventory]; arr[i] = { ...arr[i], weight: parseFloat(e.target.value) || 0 }; update("inventory", arr); }} />
                    <button className="danger-btn" onClick={() => update("inventory", char.inventory.filter((_, j) => j !== i))}>✕</button>
                  </div>
                ))}
                {char.inventory.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#8a7560", textAlign: "right" }}>
                    Total Weight: {char.inventory.reduce((acc, it) => acc + (it.weight * it.qty), 0).toFixed(1)} lb
                    {" / "}{char.str * 15} lb capacity
                  </div>
                )}

                {/* Lifestyle */}
                <div style={{ marginTop: 16 }}>
                  <div className="field-label">Lifestyle</div>
                  <select className="field-input" value={char.lifestyle} onChange={e => update("lifestyle", e.target.value)}>
                    {["Wretched","Squalid","Poor","Modest","Comfortable","Wealthy","Aristocratic"].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== BIOGRAPHY TAB ===== */}
        {activeTab === "biography" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left Column */}
            <div>
              {/* Physical Description */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title">Physical Description</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                  {[["age","Age"],["gender","Gender"],["height","Height"],["weight","Weight"],["hair","Hair"],["eyes","Eyes"],["skin","Skin"]].map(([key, label]) => (
                    <div key={key}><div className="field-label">{label}</div><input className="field-input" value={char[key] || ""} onChange={e => update(key, e.target.value)} /></div>
                  ))}
                </div>
                <div><div className="field-label">Appearance Description</div>
                  <textarea className="trait-textarea" value={char.appearance} onChange={e => update("appearance", e.target.value)} placeholder="Describe your character's appearance..." />
                </div>
              </div>

              {/* Personality */}
              <div className="card">
                <div className="section-title">Personality</div>
                {[
                  { key: "personalityTraits", label: "Personality Traits", bg: selectedBg?.traits },
                  { key: "ideals", label: "Ideals", bg: selectedBg?.ideals?.map(i => typeof i === "object" ? `${i.ideal} (${i.alignment})` : i) },
                  { key: "bonds", label: "Bonds", bg: selectedBg?.bonds },
                  { key: "flaws", label: "Flaws", bg: selectedBg?.flaws },
                ].map(({ key, label, bg }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div className="field-label">{label}</div>
                      {bg?.length > 0 && (
                        <select style={{ fontSize: 10, background: "#1a1625", color: "#8a7560", border: "1px solid #3a2a1a", borderRadius: 4, padding: "2px 4px" }}
                          onChange={e => { if (e.target.value) { update(key, (char[key] ? char[key] + "\n" : "") + e.target.value); e.target.value = ""; } }}>
                          <option value="">💡 Suggestions...</option>
                          {bg.map((t, i) => <option key={i} value={t}>{t.length > 60 ? t.slice(0, 60) + "..." : t}</option>)}
                        </select>
                      )}
                    </div>
                    <textarea className="trait-textarea" value={char[key]} onChange={e => update(key, e.target.value)} placeholder={`Your character's ${label.toLowerCase()}...`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title">Character History</div>
                <textarea className="trait-textarea" style={{ minHeight: 200 }} value={char.backstory} onChange={e => update("backstory", e.target.value)} placeholder="Your character's backstory, history, and defining moments..." />
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title">Allies & Organizations</div>
                <textarea className="trait-textarea" style={{ minHeight: 100 }} value={char.allies} onChange={e => update("allies", e.target.value)} placeholder="Guilds, factions, companions, patrons..." />
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title">Enemies</div>
                <textarea className="trait-textarea" style={{ minHeight: 80 }} value={char.enemies} onChange={e => update("enemies", e.target.value)} placeholder="Rivals, nemeses, wanted by..." />
              </div>

              {/* Character Summary Card */}
              {(char.race || char.className) && (
                <div className="card" style={{ background: "linear-gradient(135deg, #1a0a0a, #1a1225)", border: "1px solid #8b0000" }}>
                  <div className="section-title" style={{ color: "#c9a84c" }}>Character Summary</div>
                  <div style={{ fontFamily: "Cinzel, serif" }}>
                    {char.characterName && <div style={{ fontSize: 20, color: "#c9a84c", marginBottom: 4 }}>{char.characterName}</div>}
                    <div style={{ fontSize: 14, color: "#e8dcc8" }}>
                      {[char.alignment, char.subrace || char.race, char.className && `${char.className} ${char.level}`].filter(Boolean).join(" · ")}
                    </div>
                    {char.background && <div style={{ fontSize: 13, color: "#8a7560", marginTop: 4 }}>Background: {char.background}</div>}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
                      {[["STR",char.str],["DEX",char.dex],["CON",char.con],["INT",char.int],["WIS",char.wis],["CHA",char.cha]].map(([ab, val]) => (
                        <div key={ab} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "#8a7560" }}>{ab}</div>
                          <div style={{ fontSize: 16, color: "#c9a84c" }}>{val} <span style={{ fontSize: 11 }}>({getModStr(val)})</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}