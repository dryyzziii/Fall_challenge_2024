// Déclaration des interfaces
//#region Typage
interface Building {
    buildingId: number;
    coordX: number;
    coordY: number;
}

interface LandingZone extends Building {
    numAstronauts: number;
    astronautTypes: number[];  // Liste des types d'astronautes à cet endroit
}

interface LunarModule extends Building {
    moduleType: number;  // Type de module (laboratoire, observatoire, etc.)
}

interface Pod {
    podId: number;
    numStops: number;
    stops: number[];  // Liste des identifiants de bâtiments desservis par cette capsule
}

interface TransportRoute {
    buildingId1: number;
    buildingId2: number;
}

interface MagneticTube extends TransportRoute {
    capacity: number;  // Capacité du tube (nombre de capsules)
}

interface ConstructionCost {
    cost: number,
    buildingid1: number,
    buildingid2
}

interface Teleporter extends TransportRoute {
    // Les téléporteurs n'ont pas de capacité, ils sont instantanés
}

interface Resources {
    totalResources: number | null;
}

enum typeAction {
    TUBE = 'TUBE',
    UPGRADE = 'UPGRADE',
    TELEPORT = 'TELEPORT',
    POD = 'POD',
    DESTROY = 'DESTROY',
    WAIT = 'WAIT'
}

interface Action {
    type: typeAction;
    details: string;  // Détails supplémentaires comme les identifiants des bâtiments impliqués
}
type Transport = MagneticTube | Teleporter;
//#endregion

/**
 * Calcule la distance entre deux bâtiments en fonction de leurs coordonnées.
 * La distance est calculée selon la formule : (coordX2 - coordX1) * 2 + (coordY2 - coordY1).
 *
 * @param {Building} b1 - Le premier bâtiment avec ses coordonnées.
 * @param {Building} b2 - Le second bâtiment avec ses coordonnées.
 * @returns {number} - La distance calculée entre les deux bâtiments.
 */
function calculDistanceTub(b1: Building, b2: Building): number {
    return (b2.coordX - b1.coordX) * 2 + (b2.coordY - b2.coordY);
}


/**
 * Retourne le signe d'un nombre.
 * - Retourne -1 si le nombre est négatif.
 * - Retourne 1 si le nombre est positif.
 * - Retourne 0 si le nombre est nul.
 *
 * @param {number} x - Le nombre dont on veut déterminer le signe.
 * @returns {number} - Le signe du nombre (-1, 0, ou 1).
 */
function sign(x: number): number {
    if (x < 0) return -1;
    if (x === null) return 0;
    return 1;
}


/**
 * Calcule l'orientation de trois bâtiments.
 * L'orientation est calculée à l'aide du produit vectoriel des coordonnées des trois points.
 * 
 * @param {Building} p1 - Le premier bâtiment (point 1).
 * @param {Building} p2 - Le deuxième bâtiment (point 2).
 * @param {Building} p3 - Le troisième bâtiment (point 3).
 * @returns {number} - Le signe du produit déterminant l'orientation des trois points (-1, 0, ou 1).
 */
function orientationFun(p1: Building, p2: Building, p3: Building): number {
    const prod = (p3.coordY - p1.coordY) * (p2.coordX - p1.coordX) - (p2.coordY - p1.coordY) * (p3.coordX - p1.coordX);
    return sign(prod);
}


/**
 * Vérifie si deux segments formés par quatre bâtiments se croisent.
 * Les segments sont AB et CD, et cette fonction vérifie s'ils s'intersectent en dehors de leurs extrémités.
 *
 * @param {Building} A - Le premier bâtiment formant le segment AB.
 * @param {Building} B - Le deuxième bâtiment formant le segment AB.
 * @param {Building} C - Le premier bâtiment formant le segment CD.
 * @param {Building} D - Le deuxième bâtiment formant le segment CD.
 * @returns {boolean} - Renvoie true si les segments AB et CD se croisent, sinon false.
 */
function segmentsIntersect(A: Building, B: Building, C: Building, D: Building): boolean {
    return orientationFun(A, B, C) * orientationFun(A, B, D) < 0 && orientationFun(C, D, A) * orientationFun(C, D, B) < 0;
}

/**
 * Calcule le nouveau coût d'augmentation de la capacité d'un tube magnétique.
 * Le coût est déterminé en fonction du coût initial du tube multiplié par la nouvelle capacité.
 *
 * @param {MagneticTube} m1 - Le tube magnétique pour lequel on souhaite calculer le nouveau coût.
 * @param {number} newCapacity - La nouvelle capacité du tube.
 * @returns {number | undefined} - Le coût calculé ou undefined si le tube n'a pas été trouvé dans la liste des coûts.
 */
function calculNewCost(m1: MagneticTube, newCapacity: number): number | undefined {
    for (let c of tubeCost) {
        if (c.buildingid1 == m1.buildingId1 && c.buildingid2 == m1.buildingId2) {
            return c.cost * newCapacity;
        }
    }
    return undefined;
}

/**
 * Ajoute une nouvelle route de transport (tube ou téléporteur) à la liste existante.
 * Si le jeu débute, les routes sont lues depuis l'entrée standard, sinon elles sont ajoutées manuellement.
 * 
 * @param isDebut - Indique si le jeu est au début (lecture des routes existantes) ou non.
 * @param capacity - (Optionnel) La capacité de la route (0 pour téléporteur).
 * @param buildingId1 - (Optionnel) L'identifiant du premier bâtiment.
 * @param buildingId2 - (Optionnel) L'identifiant du second bâtiment.
 */
function addTransportRoute(isDebut: boolean, capacity?: number, buildingId1?: number, buildingId2?: number) {
    if(isDebut){
        const numTravelRoutes: number = +readline();
        console.error('numTravelRoutes',numTravelRoutes)
        for (let i = 0; i < numTravelRoutes; i++) {
            const [buildingId1, buildingId2, capacity] = readline().split(' ').map(Number);
            console.error('buildingId1',buildingId1)
            console.error('buildingId2',buildingId2)
            console.error('capacity',capacity)
            const route = capacity === 0
                ? { buildingId1, buildingId2 } as Teleporter // Création du téléporteur
                : { buildingId1, buildingId2, capacity } as MagneticTube; // Création du tube
            console.error('route',route)

            transportRoutes.push(route);
        }
    }
    else {

    }
}

/**
 * Ajoute des capsules existantes ou manuellement à la liste des pods.
 * Si le jeu débute, les capsules sont lues depuis l'entrée standard, sinon elles sont ajoutées manuellement.
 * 
 * @param isDebut - Indique si le jeu est au début (lecture des capsules existantes) ou non.
 * @param numPods - (Optionnel) Nombre de capsules à ajouter.
 * @param podId - (Optionnel) Identifiant unique de la capsule.
 * @param numStops - (Optionnel) Nombre d'arrêts sur l'itinéraire de la capsule.
 * @param stops - (Optionnel) Tableau des identifiants des bâtiments sur l'itinéraire de la capsule.
 */
function addPods(isDebut: boolean, numPods?: number, podId?: number, numStops?: number, stops?: number[]) {
    if(isDebut){
        // Lecture des capsules existantes
        const numPods: number = +readline();
        for (let i = 0; i < numPods; i++) {
            const [podId, numStops, ...stops]: number[] = readline().split(' ').map(Number)
            const pod: Pod = {
                podId,
                numStops,
                stops
            };
            pods.push(pod);
        }
    }
    else {

    }
}

/**
 * Ajoute des bâtiments (aire d'atterrissage ou module lunaire) à la liste des bâtiments.
 * Si le jeu débute, les bâtiments sont lus depuis l'entrée standard, sinon ils sont ajoutés manuellement.
 * 
 * @param isDebut - Indique si le jeu est au début (lecture des nouveaux bâtiments) ou non.
 * @param typeOrZone - (Optionnel) Type de bâtiment (0 pour aire d'atterrissage, sinon module lunaire).
 * @param buildingId - (Optionnel) Identifiant unique du bâtiment.
 * @param coordX - (Optionnel) Coordonnée X du bâtiment.
 * @param coordY - (Optionnel) Coordonnée Y du bâtiment.
 * @param rest - (Optionnel) Informations supplémentaires (nombre d'astronautes et types).
 */
function addBuildings(isDebut: boolean, typeOrZone?: number, buildingId?: number, coordX?: number, coordY?: number, rest?: any){
    if(isDebut) {
        const numNewBuildings: number = +readline();

        for (let i = 0; i < numNewBuildings; i++) {
            const [typeOrZone, buildingId, coordX, coordY, ...rest] = readline().split(' ').map(Number);

            if (typeOrZone === 0) {  // Aire d'atterrissage
                const numAstronauts = rest[0];
                const astronautTypes = rest.slice(1, numAstronauts + 1);

                const building: LandingZone = {
                    buildingId,
                    coordX,
                    coordY,
                    numAstronauts,
                    astronautTypes
                };

                newBuildings.push(building);
            } else {  // Module lunaire
                const building: LunarModule = {
                    moduleType: typeOrZone,
                    buildingId,
                    coordX,
                    coordY
                };

                newBuildings.push(building);
            }
        }
    }
    else {

    }
}


interface boolTubeExistant {
    isCroise: boolean;
    isOnBuilding: boolean
}
/**
 * Vérifie si un tube croise un autre tube ou s'il s'agit d'un téléporteur.
 * 
 * @param building1 - Le premier bâtiment du tube à vérifier.
 * @param building2 - Le second bâtiment du tube à vérifier.
 * @returns Un objet boolTubeExistant contenant deux propriétés :
 *          - isTeleporter : booléen indiquant si le tube est un téléporteur.
 *          - isCroise : booléen indiquant si le tube croise un autre tube.
 */
function verificationTubeExistant(building1: Building, building2: Building): boolTubeExistant {
    let interfaceTubeExist: boolTubeExistant = {
        isCroise: false,
        isOnBuilding: false
    }
    
    for(let bu of newBuildings) {
        if(pointOnSegment(bu, building1, building2)){
            interfaceTubeExist.isOnBuilding = true
        }
    }

        // Vérification des tubes déjà existants
        for (let t of transportRoutes) {
            // Trouver les bâtiments correspondants au tube
            let tubeBuilding1: Building | undefined = newBuildings.find((b: Building) => b.buildingId === t.buildingId1);
            let tubeBuilding2:  Building | undefined = newBuildings.find((b: Building) => b.buildingId === t.buildingId2);
            console.error("tubeBuilding1", tubeBuilding1)
            console.error("tubeBuilding2", tubeBuilding2)

            if (tubeBuilding1 && tubeBuilding2) {
                // Vérification si les segments se croisent
                if (segmentsIntersect(building1, building2, tubeBuilding1, tubeBuilding2)) {
                    interfaceTubeExist.isCroise = true; // Les segments se croisent
                }
            }
        }
    return interfaceTubeExist;
}



function addTubeCost(distanceTubeCalc: number, buildingId1: number, buildingId2: number) {
    tubeCost.push({
        cost: distanceTubeCalc,
        buildingid1: buildingId1,
        buildingid2: buildingId2
    });
}

function distance(b1: Building, b2: Building): number {
    return Math.sqrt((b2.coordX-b1.coordX)** 2 + (b2.coordY - b1.coordY) ** 2)
}

function pointOnSegment(bu_verif: Building, bu_src: Building, bu_dest: Building): boolean {
    const epsilon: number = 0.0000001
    const d1 = distance(bu_src, bu_verif)
    const d2 = distance(bu_verif, bu_dest) 
    const d3 = distance(bu_src, bu_dest) // tube
    return (d1 + d2  -  d3) > epsilon // true -> faisable
}


function gestionTubeTeleporter() {
    // parcours tout les buildings avec 2 index
    for (let i = 0; i < newBuildings.length; i++) {
        for (let y = i + 1; y < newBuildings.length; y++) { // éviter de comparer les mêmes paires plusieurs fois
            let building1 = newBuildings[i];
            let building2 = newBuildings[y];
            let isTeleporter: boolean = false;
            console.error("building1",building1)
            console.error("building2",building2)

            if (building1.buildingId === 0 || building2.buildingId === 0) {
                isTeleporter = true; // Tube entre des bâtiments avec ID 0 est un téléporteur
            } 
            // vérification des tubes présent et récupération des booleens isCroise et isOnBuilding
            const interfaceTubeExistant: boolTubeExistant = verificationTubeExistant(building1, building2)
            console.error("interfaceTubeExistant",interfaceTubeExistant)
            if (
                !interfaceTubeExistant.isCroise 
                && !isTeleporter 
                && !interfaceTubeExistant.isOnBuilding
            ) {
                let distanceTubeCalc = calculDistanceTub(building1, building2);

                // Vérification des ressources et duplication de tube
                if (resources.totalResources && resources.totalResources > distanceTubeCalc && !tubeCost.some(a => 
                    (a.buildingid1 === building1.buildingId && a.buildingid2 === building2.buildingId) || 
                    (a.buildingid1 === building2.buildingId && a.buildingid2 === building1.buildingId))) {
                    addTubeCost(distanceTubeCalc, building1.buildingId, building2.buildingId)
                    actions.push({
                        type: typeAction.TUBE,
                        details: `${building1.buildingId} ${building2.buildingId}`
                    });
                }
                
            }
            if (
                isTeleporter 
                && resources.totalResources 
                && resources.totalResources > TELEPORT_RESSOURCE) {
                    actions.push({
                        type: typeAction.TELEPORT,
                        details: `${building1.buildingId} ${building2.buildingId}`
                    });
            }
        }
    }
}

function sortirActions() {
    // Sortie des actions (format attendu par le jeu)
    const actionString = actions.map(action => `${action.type} ${action.details}`).join(';');
    console.error('console envoyé',actionString);
    if (actionString) {
        console.log(actionString);
    } else {
        console.log('WAIT');
    }

    actions = []; // Réinitialiser les actions pour le prochain tour
}

//#region constante
const TELEPORT_RESSOURCE: number = 5000;
//#endregion

//#region variables globales
let actions: Action[] = [];
let newBuildings: Building[] = [];
let tubeCost: ConstructionCost[] = [];
let transportRoutes: Transport[] = [];
let pods: Pod[] = [];
let resources: Resources = { totalResources: null };
//#endregion

while (true) {
    // Lecture des ressources disponibles
    resources.totalResources = +readline()
    // console.error('readline',readline())
    // console.error('readline',readline())
    // console.error('readline',readline())
    addTransportRoute(true);
    addPods(true);
    addBuildings(true);

    console.error('transportRoutes', transportRoutes)
    
    // gestion des tubes et des teleporter
    gestionTubeTeleporter();

    // #region todo UPGRADE
        // calculNewCost(undefined, 0)
    // for(let tube of transportRoutes) {
    

    sortirActions();
}




function readline(): string {
    throw new Error("Function not implemented.");
}
