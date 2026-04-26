export const BUILDING_TEXTS = {
    "hq": {
        text: [
            "Sídlo společnosti Pacific Railroad",
            "Zde se rozhoduje o osudu železnice",
            "Zde se rozhoduje o osudu železnice"
        ],
        sprite: [0, 1, "S"],
        spritePos: ["L", "C", "P"]
        //unused
    },
    "sheriff": {
        text: [
            "Jsi tu novej?",
            "Sheriff Nadledvinka... A ty jsi?",
            "Od železnice? No výborně-",
            "Bál jsem se, že dorazíš, až když bude pozdě...",
            "Jako JEDINÝ doopravdový Sheriff Rudé Skály tě budu muset chránit a varovat, zelenáči.",
            "Mezi náma, kašlat na rudochy, ale nepotřebuju, aby mi sem přišli vykuchat manželku.",
            "Takže navrhuji!",
            "Nestav nic přes indiánská území a neznepřátel si ani jejich obyvatele, ani mě!",
            "Někdy se zastav. Salut, Greenhorne!"
        ],
        sprite: [0, 1, 1, 1, 0, 1, 0, 1, 1],
        spritePos: ["L", "C", "P", "C", "L", "C", "C", "C", "C", "C"]
    },
    "bank": {
        text: [
            "Ovšem dobrý den...",
            "Přišel jste si půjčit?",
            "Samozřejmě že dorazil, konkurenci jsme zlikvidovali :D",
            "Jaké blaho je ten monopol, není-liž pravda?",
            "Představte si, mezi kolika lháři a podvodníky byste musel vybírat!",
            "Kdybych tu nebyl já totiž, žeano!!!",
            "Vrhneme se na věc?"
        ],
        afterTransaction: {
            text: [
                "Díky za vaše peníze!",
                "Milujeme peníze.",
                "Máme jich hodně. A to je dobře."
            ],
            sprite: [1, 1, 1],
            spritePos: ["C", "C", "C"]
        },
        sprite: [0, 1, "S", 1,0,0,1],
        spritePos: ["C", "C", "C", "C", "C", "C", "C"],
        transaction: {
            type: "bank",
            cost: 0,
            failText: "Uh-uh, transakce zrušena.",
            questionSprite: "S",
            questionSpritePos: "C",
            successSprite: "S",
            successSpritePos: "C",
            failSprite: 1,
            failSpritePos: "C",
            question: "Kolik si půjčíme?",
            bankOptions: {
                maxLoan: 5000,
                interestRate: 2,
                repaymentTime:5
            }
        }
    },
    "graveyard": {
        text: [
            "Uff... Ufff...",
            "Nohy bolí, ruce chřadnou... Nedostal já dlouho almužnu žádnou!",
            "Tenhle malý hřbitov hnije, a mně koleno samou bolestí-",
            "už roky a staletí, utrpením krev snad pije!",
            "Stáří to je zlo a hrůza, fakt že jo-",
            "metla, jež přebije kdejaká mužstva",
            "Francouze, Turka i Bělorusa-",
            "nebo",
            "Jana Husa, Jana Žižku, Karla Husa,",
            "ehh",
            "...",
            "Karla Žižku",
            "fakt že jo!",
            "Almužničku? Vyměním za všelijaká moudra!"
        ],
        afterTransaction: {
            text: [
                "Nestavěl bych nějak blízko jezerům- stoletá voda spláchne koleje dobrákům i mizerům...",
                "Půjčky,půjčky... Ředitel banky je silák. Zvedá jednoručky. Osobně ti vytrhá koleje, když nezaplatíš včas, haha!",
                "V Evropě i v Koreji se obejdou bez kolejí (typu-T)! (knedlíky kynu-T!)",
                "Pro kontakt s osobou daného města nemusíš mít aktivní kolejové spojení! (rýmová resignace)",
                "Olda možná pije, ale ví kdy a která bije! Poslechni ho.",
                "Dobré skutky tady taky občas něco stojí. Občas dost a občas víc.",
                "Upovídance můžeš umlčet pomocí Esc."
            ],
            sprite: [0, 1, 1, 0, 1, 0,0],
            spritePos: ["C", "C", "C", "C", "C", "C", "C"]
        },
        sprite: [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
        spritePos: ["P", "P", "P", "P","C","C", "P", "P", "P", "P", "P", "P", "P", "C"],
        transaction: {
            cost: 67,
            failText: "Nemáš dost peněz na příspěvek.",
            questionSprite: 1,
            questionSpritePos: "C",
            failSprite: 0,
            failSpritePos: "C",
            question: "Vyslechneš si moudro??",
            randomAfterText: true
        }
    },
    "olda": {
        text: [
            "GYAHAHAHAHAHAHAH",
            "-tady Olda-",
            "...........",
            "cítim z tebe....",
            "hmmmm.....",
            "DOBRODRUŽSTVÍ!!!",
            "BAHAHAHAHAHAHAH!!!",
            "c í t i m  t v o j e  p o h n o j e n ý  g a t ě",
            "troubo! bahaahahaha!",
            "jestliže děláš ty koleje... mohli bychom si navzájem pomoct!",
            "protože tahle winchestrovka moc ráda střílí",
            "moc ráda střílí a moc moc moc!",
            "kdybys byl od tý dobroty a stavěl koleje kolem bizonů, mohli bychom z toho udělat velkou zábavu a trhnout velký prachy!",
            "za malej příspěvek do toho s tebou milerád pujdu. co ty na to?",
            "jeiltokpytoplatíto?!"
        ],
        afterTransaction: {
            text: [
                "výborně! a táta říkal,že to nikam nedotáhnu!",
                "BAHAHAHAHA"
            ],
            sprite: [0, 0],
            spritePos: ["C", "C"]
        },
        sprite: [0, 1, 0, 0, 0, 1,0,1,0,0,0,0,0,0,1],
        spritePos: ["C", "C", "C","C","C", "C", "C","C","C", "C", "C","C","C", "C", "C"],
        transaction: {
            type: "unlock_bison",
            cost: 100,
            successText: "Stav koleje podél bizoních oblastí. NE PŘES! pro svůj podíl se kdykoli stav!",
            failText: "Nemáš dostatek financí.",
            question: "Uzavřít dohodu s Oldou?",
            questionSprite: 1,
            questionSpritePos: "C",
            successSprite: 1,
            successSpritePos: "C",
            failSprite: 0,
            failSpritePos: "C",
        }
    },
    "gallery": {
        text: [
            "Vítej! My jsme se už viděli! Pamatuješ?",
            "To jsem ale tehdá ještě chytal motýly! Hahah! A ten vlak! Jak jel do Indianapolis!",
            "Ne?",
            "Neva... Stejně mě to oko ještě pořád bolí.",
            "Jenom jedna fotka a zvěčním tvé sítě železnic mezi ostatními génii v galerii!"
        ],
        sprite: [0, 0, 0,0,"S"],
        spritePos: ["P", "P","P","P", "C"]
    },
    "shop": {
        text: [
            "Vítej!!! Mám tu toho dost!"
        ],
        sprite: [0],
        spritePos: ["L"]
    },
    "barber": {
        text: [
            "Takže- ostříhat?",
            "Hele mlaďas. Mám pár pravidel-",
            "1) Žádný kecy o tom, že mi smrdí ruce od cigára. Tobě smrdí haksny a stejně tě ostříhám.",
            "Smrade",
            "Zelenáči,",
            "Modráku,",
            "Žluťasi,",
            "Troubo,",
            "Výborně, už můžem začít."
        ],
        sprite: [0, 1, 1, 0, 0,0,0,1,"S"],
        spritePos: ["C", "C", "C","C", "C", "C","C", "C", "C"]
    },
    "marco": {
        text: [
            "Vítej v hadrech Švece Marca!",
            "jen si vyper, co chceš!",
            "chtěl jsem říct vyber, ale tvý nohy-",
            "vyber a vyper- tak!",
            "sorry",
            "a někdy se zas stav, s těma tvejma známostma u železničářů bych pro tebe možná mohl někdy mít nějakej džab!",
            "džeb?",
            "džob!"
        ],
        sprite: [0, 1, 1, 0, 1,0,0,1],
        spritePos: ["P", "P", "P", "P","P", "P", "P", "P"]
    },"bussiness": {
    text: [
        "Znáš Teda?",
        "To jsem já! Mám pro tebe exkluzivní nabídku!",
        "Čekal jsem na tebe a ty tvoje vláčky!",
        "Jen! na tebe! a ty tvoje vláčky!!",
        "Co takhle-",
        "odkupovat palivo ode mě? Mám pro tebe naprosto přírodní uhlí, které zaručí dvojnásobnej výkon lokomotiv! A to není všechno-",
        "Občas i trojnásobnej! Naprosto přírodní!"
    ],
    afterTransaction: {
        text: [
            "Dík za investici!",
        ],
        sprite: ["S"],
        spritePos: ["C"]
    },
    sprite: [0, "S", 0, "S", 0, 0,"S"],
    spritePos: ["C", "C", "C", "C", "C", "C", "C"],
    transaction: {
        type: "unlock_speed",
        cost: 1500,
        successText: "Investice přijata! Cestující cení novou rychlost vlaků a příroda brečí",
        failText: "Nemáš dostatek financí.",
        questionSprite: "S",
        questionSpritePos: "C",
        successSprite: "S",
        successSpritePos: "C",
        failSprite: 0,
        failSpritePos: "C",
        question: "Pořídit naprosto zdravotně nezávadné uhlí pro čtyřnásobný výkon lokomotiv?"
    }
},
    "mech": {
        text: [
            "Nazdar synku! To jsem já, kvůli komu nemůžeš stavět T koleje, haha!",
            "Chápu tvoje rozhořčení, ale vysvětli mi, proč bych ti prodával něco, díky čemu by sis už třeba nikdy nepořídil dražší křižovatku??",
            "To mi teda pověz, ahahahah! To teda jo!",
            "Leda že by sis zaplatil... To bychom si možná pokecali, co ty na to?",
            "Miluju kapitalismus!",
            "nemáme s maželkou co jíst"
        ],
        sprite: ["S", 0, 1, 0, 0, "S"],
        spritePos: ["L", "L","L", "L", "L", "C"],
        transaction: {
            type: "unlock_tracks", 
            cost: 1000,
            successText: "Děkujeme za nákup! Nová lokomotiva brzy dorazí.",
            failText: "Nemáš dost peněz, příteli.",
            questionSprite: 0,
            questionSpritePos: "C",
            successSprite: "S",
            question: "Odemknout nový typ kolejí?"
        }
    },
    "church": {
        text: [
            "Vítej synu!",
            "Můžeš nám přispět? Pomodlím se za tebe."
        ],
        sprite: [0, 0],
        spritePos: ["C", "C"]
    },
    "none": {
        text: [
            "error"
        ],
        sprite: [0, 1, 2],
        spritePos: ["L", "C", "P"]
    }
};

export const DEFAULT_BUILDING_TEXT = {
    text: [
        "error"
    ],
    sprite: [0]
};
/*export const TUTORIAL_TEXTS = {
    text:[ [
        "goal, space, shift",
        "ouje"
    ],[
        "za vlastni prachy",
        "bahahaha",
    ],[
        "jsi ready na the real deal",
    ],[
        "social",
    ]]
};*/