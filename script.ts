// Déclaration des interfaces
//#region Typage
interface boolTubeExistant {
    isCroise: boolean; // si il croise d'autre tube existant
    isOnBuilding: boolean  // si il passe sur un building existant
}
interface boolTeleporterExistant {
    isLandingZone: boolean; // si c'est un teleporter
    // isComplet: boolean; // si il a encore de la place pour acceuillir des astronautes
    // isBonType: boolean // si l'astronautes a teleporter a le type autorisé
    isallReadyTP: boolean; // si le batiment a affecté est déjà une entré ou sortie de teleporter existant
}
interface Building {
    buildingId: number;
    coordX: number;
    coordY: number;
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
    astronauts: Astronaut[];
}

interface TransportRoute {
    buildingId1: number;
    buildingId2: number;
}

interface MagneticTube extends TransportRoute {
    pods: Pod[];
    capacity: number;  // Capacité du tube (nombre de capsules)
}

interface ConstructionCost {
    cost: number;
    buildingid1: number;
    buildingid2: number;
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

interface Astronaut {
    astronautId: number;
    type: number;  // Type d'astronaute
    destination: number | null;  // Identifiant du bâtiment où il doit se rendre
}
class UnionFind {
    parent: number[];
    rank: number[];

    constructor(n: number) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = Array(n).fill(0);
    }

    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    union(x: number, y: number): void {
        const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX !== rootY) {
            if (this.rank[rootX] > this.rank[rootY]) {
                this.parent[rootY] = rootX;
            } else if (this.rank[rootX] < this.rank[rootY]) {
                this.parent[rootX] = rootY;
            } else {
                this.parent[rootY] = rootX;
                this.rank[rootX]++;
            }
        }
    }
}
//#endregion


/**
 * Algorithme de Kruskal pour construire l'arbre couvrant minimum (MST).
 * Il permet de relier tous les bâtiments avec le coût minimal.
 */
function kruskalMST(): { routes: Transport[], cost: number } {
    const edges: { buildingId1: number, buildingId2: number, cost: number }[] = [];

    // Générer toutes les arêtes possibles avec leur coût
    for (let i = 0; i < newBuildings.length; i++) {
        for (let j = i + 1; j < newBuildings.length; j++) {
            const cost = calculDistanceTub(newBuildings[i], newBuildings[j]);
            edges.push({
                buildingId1: newBuildings[i].buildingId,
                buildingId2: newBuildings[j].buildingId,
                cost
            });
        }
    }

    // Trier les arêtes par coût croissant
    edges.sort((a, b) => a.cost - b.cost);

    // Algorithme de Kruskal pour sélectionner les arêtes
    const unionFind = new UnionFind(newBuildings.length);
    const mst: Transport[] = [];
    let totalCost = 0;

    for (const edge of edges) {
        const { buildingId1, buildingId2, cost } = edge;
        if (unionFind.find(buildingId1) !== unionFind.find(buildingId2)) {
            unionFind.union(buildingId1, buildingId2);
            mst.push({ buildingId1, buildingId2, capacity: 1 } as MagneticTube); // Ajuster la capacité si nécessaire
            totalCost += cost;
        }
    }

    return { routes: mst, cost: totalCost };
}





// Vérification si le bâtiment de destination est accessible
function verifieTrajetPourAstronaute(astronaut: Astronaut, path: number[]): boolean {
    // Vérifie que le chemin passe par le bâtiment de destination de l'astronaute
    return astronaut.destination != null ? path.includes(astronaut.destination) : false;
}
function assignerTrajetsAstronautes(astronaut: Astronaut) {
        // let distances = dijkstra(astronaut.astronautId);
        // let path = distances[astronaut.destination != null ? astronaut.destination : 0].path;

        // if (verifieTrajetPourAstronaute(astronaut, path)) {
           
        // }
    
}


/**
 * Calcule la distance entre deux bâtiments en fonction de leurs coordonnées.
 * La distance est calculée selon la formule : (coordX2 - coordX1) * 2 + (coordY2 - coordY1).
 *
 * @param {Building} b1 - Le premier bâtiment avec ses coordonnées.
 * @param {Building} b2 - Le second bâtiment avec ses coordonnées.
 * @returns {number} - La distance calculée entre les deux bâtiments.
 */
function calculDistanceTub(b1: Building, b2: Building): number {
    return Math.sqrt(Math.pow(b2.coordX - b1.coordX, 2) + Math.pow(b2.coordY - b1.coordY, 2)) * 10;
}

function gestionTraficEtUpgrade() {
    getListTube().forEach(route => {
        if (calculerTraficSurRoute(route) > route.capacity * 10) {
            upgradeTube(route);
        }
    });
}

function calculerTraficSurRoute(route: MagneticTube): number {
    return 10 * route.pods.length;;
}

function getNumberOfPods(route: MagneticTube): number {
    let numberOfPod = 0;
    podsList.forEach((podRoute: MagneticTube) => {
        if (
            (podRoute.buildingId1 == route.buildingId1 && podRoute.buildingId2 == route.buildingId2) ||
            (podRoute.buildingId1 == route.buildingId2 && podRoute.buildingId2 == route.buildingId1)
        ) {
            numberOfPod++;
        }
    });
    return numberOfPod;
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

function upgradeTube(route: MagneticTube) {
    let newCapacity: number = 0;
    const listMagneticTube = getListTube();

    listMagneticTube.forEach((tube: MagneticTube) => {
        if(route === tube){
            newCapacity = route.capacity + 1; // Stocker la nouvelle capacité
            route.capacity += 1;
        }
    })

    // console.error('newCapacity', newCapacity);
    // console.error('tubeToUpgrade', tubeToUpgrade);
    // Vérifier si on a trouvé un tube à upgrader et si la nouvelle capacité est valide
    if (newCapacity !== 0) {
        // Calculer le coût de l'upgrade
        let building1: Building = newBuildingsMap.get(route.buildingId1)!;
        let building2: Building = newBuildingsMap.get(route.buildingId2)! ;
        const newCost = calculDistanceTub(building1, building2) * newCapacity;
        if (hasSufficientResources(newCost)) {
            // Ajouter l'action d'upgrade
            actions.push({
                type: typeAction.UPGRADE,
                details: `${route.buildingId1} ${route.buildingId2}`
            });
            resources.totalResources! -= newCost!;
        }
    }
    return route
}

function verifIdBuiling(id1: number,id2: number, id3: number, id4: number): boolean {
    return (id1 == id3 && id2 == id4) || (id2 == id3 && id1 == id4)
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
    for (let c of tubeCostList) {
        if (c.buildingid1 == m1.buildingId1 && c.buildingid2 == m1.buildingId2) {
            c.cost = c.cost * newCapacity
            return c.cost;
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
    if (isDebut) {
        const numTravelRoutes: number = +readline(); // Nombre de routes de transport
        // console.error('numTravelRoutes', numTravelRoutes);

        for (let i = 0; i < numTravelRoutes; i++) {
            const [buildingId1, buildingId2, capacity] = readline().split(' ').map(Number); // Lecture des données d'une route

            let routeExists = false;
            for (let tr of transportRoutes) {
                const magnetic = tr as MagneticTube;
                // Vérifier si une route existe déjà entre les mêmes bâtiments
                if (magnetic.buildingId1 === buildingId1 && magnetic.buildingId2 === buildingId2) {
                    routeExists = true;

                    if (magnetic.capacity && capacity !== 0 && magnetic.capacity !== capacity) {
                        // Si la capacité est différente, mise à niveau
                        // console.error('Mise à niveau du tube');
                        // upgradeTube(); // Appel de la fonction de mise à niveau
                    }
                    break; // Sortir de la boucle si la route est trouvée
                }
            }

            // Si aucune route n'existe encore, ajouter une nouvelle route
            if (!routeExists) {
                const route = capacity === 0
                    ? { buildingId1, buildingId2 } as Teleporter // Création d'un téléporteur
                    : { buildingId1, buildingId2, capacity, pods: [] } as MagneticTube; // Création d'un tube magnétique

                // console.error('Nouvelle route ajoutée :', route);
                transportRoutes.push(route); // Ajout de la nouvelle route
            }
        }
    } else {
        const route = capacity === 0
            ? { buildingId1, buildingId2 } as Teleporter // Création d'un téléporteur
            : { buildingId1, buildingId2, capacity, pods: [] } as MagneticTube; // Création d'un tube magnétique

        transportRoutes.push(route); // Ajout de la nouvelle route
    }
}

function ajouterAstronautesDansBatiment(batimentId: number, astronauts: Astronaut[]) {
    let building = newBuildingsMap.get(batimentId);

    if (building) {
        astronauts.forEach(astronaut => {
            // Ajoute le type d'astronaute au bâtiment s'il n'est pas déjà présent
            if (!building.astronautTypes.includes(astronaut.type)) {
                building.astronautTypes.push(astronaut.type);
            }
            building.numAstronauts++;
        });
    }
}

function deplacerPods() {
    pods.forEach(pod => {
        let destinationBuildingId = pod.stops[pod.stops.length - 1];  // Dernier arrêt du pod
        
        // Transfert des astronautes à l'arrivée
        ajouterAstronautesDansBatiment(destinationBuildingId, pod.astronauts);

        // Vider le pod une fois les astronautes transférés
        pod.astronauts = [];
    });
    
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
            if(!pods.some(a => (a.podId == podId))){
                const pod: Pod = {
                    podId,
                    numStops,
                    stops,
                    astronauts: []
                };
                pods.push(pod);
            }
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

            let buildingExist = false;
            // vérification si le buildings existe déjà
            for(let bu of newBuildings){
                if(bu.buildingId === buildingId) buildingExist = true;
                if(buildingExist) break;
            }

            if(!buildingExist){
                if (typeOrZone === 0) {  // Aire d'atterrissage
                    const numAstronauts = rest[0];
                    const astronautTypes = rest.slice(1, numAstronauts + 1);
    
                    const building: Building = {
                        buildingId: buildingId,
                        coordX: coordX,
                        coordY: coordY,
                        numAstronauts: numAstronauts,
                        astronautTypes: astronautTypes
                    };
                    for(let i = 0; i < building.numAstronauts; i++){
                        let idAstronaut: number = 
                            astronautMap.get(astronautMap.size-1)?.astronautId !== undefined ?
                                astronautMap.get(astronautMap.size-1)!.astronautId : 0

                        const astronaut: Astronaut = {
                            astronautId: idAstronaut,
                            type: astronautTypes[i],
                            destination: null
                        }
                        astronautMap.set(astronaut.astronautId, astronaut)
                    }

    
                    newBuildings.push(building);
                } else {  // Module lunaire
                    const building: LunarModule = {
                        moduleType: typeOrZone,
                        buildingId: buildingId,
                        coordX: coordX,
                        coordY: coordY,
                        numAstronauts: 0,
                        astronautTypes: []
                    };
    
                    newBuildings.push(building);
                }
            }
        }
    }
    else {

    }
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
        if(pointOnSegment(bu, building1, building2) && bu !== building1 && bu !== building2){
            interfaceTubeExist.isOnBuilding = true
        }
    }

        // Vérification des tubes déjà existants
        for (let t of transportRoutes) {
            // Trouver les bâtiments correspondants au tube
            let tubeBuilding1: Building | undefined = newBuildings.find((b: Building) => b.buildingId === t.buildingId1);
            let tubeBuilding2:  Building | undefined = newBuildings.find((b: Building) => b.buildingId === t.buildingId2);
            if (
                tubeBuilding1 &&
                tubeBuilding2 &&
                (building1 !== tubeBuilding1 && building2 !== tubeBuilding2) &&
                (building2 !== tubeBuilding1 && building1 !== tubeBuilding2)
            ) {
                // Vérification si les segments se croisent
                if (segmentsIntersect(building1, building2, tubeBuilding1, tubeBuilding2)) {
                    interfaceTubeExist.isCroise = true; // Les segments se croisent
                }
            }
        }
    return interfaceTubeExist;
}

function addTubeCost(distanceTubeCalc: number, buildingId1: number, buildingId2: number) {
    tubeCostList.push({
        cost: distanceTubeCalc,
        buildingid1: buildingId1,
        buildingid2: buildingId2
    });
}

function distance(p1: Building, p2: Building): number {
    return Math.sqrt(Math.pow(p2.coordX- p1.coordX, 2) + Math.pow(p2.coordY - p1.coordY, 2));
}

function pointOnSegment(A: Building, B: Building, C: Building): boolean {
    const epsilon = 0.0000001;
    return Math.abs(distance(B, A) + distance(A, C) - distance(B, C)) < epsilon;
}

interface Occurrence {
    type: number;
    occurrences: number;
}

function compterOccurrences(tableau: number[]): Occurrence[] {
    let comptages: { [key: number]: number } = {};  // Objet pour stocker les occurrences

    // Parcourir le tableau
    tableau.forEach(element => {
        // Si l'élément existe déjà dans l'objet, on incrémente le compteur
        if (comptages[element]) {
            comptages[element]++;
        } else {
            // Sinon, on initialise le compteur pour cet élément à 1
            comptages[element] = 1;
        }
    });

    // Convertir l'objet des comptages en un tableau d'objets Occurrence
    let occurrencesTable: Occurrence[] = [];
    for (let type in comptages) {
        occurrencesTable.push({ type: parseInt(type), occurrences: comptages[type] });
    }

    return occurrencesTable;
}


function simulateCostTube(building1: Building, building2: Building) {
    const tubeCost = calculDistanceTub(building1, building2);
    let totalCost = tubeCost;
    let numberType: Occurrence[] = []
    if(building1.astronautTypes.length > 0) {
        numberType = compterOccurrences(building1.astronautTypes)
    }
    if(building2.astronautTypes.length > 0) {
        numberType = compterOccurrences(building2.astronautTypes)
    }
    
    numberType.forEach((occurence: Occurrence) => {
        const numberNeedToUpgrade: number = Math.floor(occurence.occurrences / 10);
        totalCost += numberNeedToUpgrade * 1000;
        totalCost += POD_RESSOURCE* numberNeedToUpgrade
    })

    return totalCost
}

function simulateCostTubeTotal(building: Building, pathRoutes: Transport[]) {
    let totalCost = 0;
    pathRoutes.forEach((route: Transport) => {
        const building1 = newBuildingsMap.get(route.buildingId1)!
        const building2 = newBuildingsMap.get(route.buildingId2)!
        const tubeCost = calculDistanceTub(building1, building2);
        totalCost += tubeCost;
        let numberType: Occurrence[] = []
        if(building1.astronautTypes.length > 0) {
            numberType = compterOccurrences(building1.astronautTypes)
        }
        if(building2.astronautTypes.length > 0) {
            numberType = compterOccurrences(building2.astronautTypes)
        }
        
        numberType.forEach((occurence: Occurrence) => {
            const numberNeedToUpgrade: number = Math.floor(occurence.occurrences / 10);
            totalCost += numberNeedToUpgrade * 1000;
            totalCost += POD_RESSOURCE* numberNeedToUpgrade
        })
    })
    

    return totalCost
}

interface SimulatedAction {
    type: typeAction;
    details: string;
    cost: number;
    zoneType: number;
    priority: number;  // Une mesure de la rentabilité ou de la priorité (ex : nombre d'astronautes transportés)
}

function gestionArrivee(): void {
    let arretes = kruskalMST();
    let simulatedActions: SimulatedAction[] = [];
    const actionSet = new Set<string>();  // Pour éviter les doublons

    LandingZoneMap.forEach((building: Building) => {
        const trajetCache: Map<number, Transport[]> = new Map(); // Cache pour stocker les trajets calculés par type

        building.astronautTypes.forEach((type: number) => {
            if (!trajetCache.has(type)) {
                const path = trouverModuleLunaireProcheByTypesAndRoutes(building.buildingId, type, arretes.routes);
                if (path) {
                    trajetCache.set(type, path);  // Stocker le chemin pour éviter de recalculer
                }
            }

            const pathForType = trajetCache.get(type);
            if (pathForType) {
                let routeForType: Transport[] = [];

                // Récupérer les tubes qui ne sont pas encore construits pour ce type
                arretes.routes.forEach((tube: Transport) => {
                    pathForType.forEach((transport: Transport) => {
                        if (
                            (tube.buildingId1 === transport.buildingId1 && tube.buildingId2 === transport.buildingId2) ||
                            (tube.buildingId1 === transport.buildingId2 && tube.buildingId2 === transport.buildingId1)
                        ) {
                            if (!transportRoutes.some(route => route === tube)) {
                                routeForType.push(tube);
                            }
                        }
                    });
                });


                let idBuildingEnd: number | null = null;
                routeForType.forEach(route => {
                    const b1 = newBuildingsMap.get(route.buildingId1)!;
                    const b2 = newBuildingsMap.get(route.buildingId2)!;
                    if ((b1 as LunarModule)?.moduleType === type) {
                        idBuildingEnd = b1.buildingId;
                    } else if ((b2 as LunarModule)?.moduleType === type) {
                        idBuildingEnd = b2.buildingId;
                    }
                });

                
                let buildingEnd: Building = newBuildingsMap.get(idBuildingEnd!)!;
                if(building.buildingId == 1) {
                    // console.error("routeForType",routeForType)
                    // console.error("idBuildingEnd",idBuildingEnd)
                }
                const totalCostForTubes = simulateCostTubeTotal(building, routeForType);
                if (buildingEnd !== null) {
                    const teleporterExists = transportRoutes.some(a =>
                        (a.buildingId1 === building.buildingId && a.buildingId2 === buildingEnd!.buildingId) ||
                        (a.buildingId1 === buildingEnd!.buildingId && a.buildingId2 === building.buildingId)
                    );
                   

                    if (totalCostForTubes > TELEPORT_RESSOURCE && !teleporterExists) {
                        const actionsTemp: SimulatedAction = {
                            type: typeAction.TELEPORT,
                            details: `${building.buildingId} ${buildingEnd.buildingId}`,
                            cost: TELEPORT_RESSOURCE,
                            priority: building.numAstronauts,
                            zoneType: type
                        };
                        if (!actionSet.has(`${actionsTemp.type}-${actionsTemp.details}-${actionsTemp.cost}`)) {
                            simulatedActions.push(actionsTemp);
                            actionSet.add(`${actionsTemp.type}-${actionsTemp.details}-${actionsTemp.cost}`);
                        }
                    } else {
                        routeForType.forEach(route => {
                            const building1 = newBuildingsMap.get(route.buildingId1)!;
                            const building2 = newBuildingsMap.get(route.buildingId2)!;
                            const tubeCost = calculDistanceTub(building1, building2);
                            const interfaceTubeExistant = verificationTubeExistant(building1, building2);

                            if (!tubeExists(building1.buildingId, building2.buildingId) &&
                                !interfaceTubeExistant.isOnBuilding && !interfaceTubeExistant.isCroise) {
                                const actionsTemp: SimulatedAction = {
                                    type: typeAction.TUBE,
                                    details: `${building1.buildingId} ${building2.buildingId}`,
                                    cost: tubeCost,
                                    priority: 10 * (route as any).capacity,  // Ajout de capacité potentielle si nécessaire
                                    zoneType: type
                                };
                                if (!actionSet.has(`${actionsTemp.type}-${actionsTemp.details}-${actionsTemp.cost}`)) {
                                    simulatedActions.push(actionsTemp);
                                    actionSet.add(`${actionsTemp.type}-${actionsTemp.details}-${actionsTemp.cost}`);
                                }
                            }
                        });
                    }
                }
            }
        });
    });

    simulatedActions.sort((a, b) => b.priority - a.priority || a.cost - b.cost);

    simulatedActions.forEach(action => {
        if (resources.totalResources! >= action.cost) {
            const [buildingId1, buildingId2] = action.details.split(' ').map(Number);
            const building1 = newBuildingsMap.get(buildingId1)!;
            const building2 = newBuildingsMap.get(buildingId2)!;
            if (action.type === typeAction.TELEPORT) {

                teleporterList.push(building1);
                teleporterList.push(building2);
                addTransportRoute(false, 0, buildingId1, buildingId2);
                transfererAstronautes(building1, building2, action.zoneType);
            } else if (action.type === typeAction.TUBE) {
                addTubeCost(action.cost, buildingId1, buildingId2);
                addTransportRoute(false, 1, buildingId1, buildingId2);
                transfererAstronautes(building1, building2, action.zoneType);
            }

            actions.push({
                type: action.type,
                details: action.details
            });

            // Déduire le coût des ressources
            resources.totalResources! -= action.cost;
        }
    });
}

// Fonction de transfert des astronautes d'un bâtiment source vers un bâtiment destination
function transfererAstronautes(sourceBuilding: Building, destBuilding: Building, type: number) {
    const astronautesAEnvoyer = sourceBuilding.astronautTypes.filter(t => t === type);
    
    if (astronautesAEnvoyer.length > 0) {
        // Supprimer les astronautes du bâtiment source
        sourceBuilding.astronautTypes = sourceBuilding.astronautTypes.filter(t => t !== type);
        sourceBuilding.numAstronauts -= astronautesAEnvoyer.length;

        // Ajouter les astronautes au bâtiment de destination
        destBuilding.astronautTypes.push(...astronautesAEnvoyer);
        destBuilding.numAstronauts += astronautesAEnvoyer.length;
    }
}


/**
 * Vérifie si un tube magnétique existe déjà entre deux bâtiments.
 * @param buildingId1
 * @param buildingId2
 * @returns {boolean}
 */
function tubeExists(buildingId1: number, buildingId2: number): boolean {
    return transportRoutes.some(route => 
        (route.buildingId1 === buildingId1 && route.buildingId2 === buildingId2) ||
        (route.buildingId1 === buildingId2 && route.buildingId2 === buildingId1)
    );
}

/**
 * Vérifie si un téléporteur existe déjà entre deux bâtiments.
 * @param buildingId1
 * @param buildingId2
 * @returns {boolean}
 */
function teleporterExists(buildingId1: number, buildingId2: number): boolean {
    return teleporterList.some(t => 
        (t.buildingId === buildingId1 && t.buildingId === buildingId2) || 
        (t.buildingId === buildingId2 && t.buildingId === buildingId1)
    );
}

function hasSufficientResources(cost: number | undefined): boolean {
    return resources.totalResources !== null && cost !== undefined && resources.totalResources >= cost;
}

function getListTube(): MagneticTube[] {
    return transportRoutes.filter((value: any) => value?.capacity !== undefined) as MagneticTube[]
}
function getListTeleporter(): Teleporter[] {
    return transportRoutes.filter((value: any) => value?.capacity === undefined) as Teleporter[]
}

function embarquerAstronautesDansPod(buildingId: number, targetModuleType: number): Astronaut[] {
    let building = newBuildingsMap.get(buildingId);
    let astronautsToTransport: Astronaut[] = [];

    if (building) {
        // Sélectionner les astronautes qui doivent aller dans le module cible
        building.astronautTypes.forEach(type => {
            if (type !== targetModuleType) {
                // Récupérer les astronautes à transporter
                astronautMap.forEach(astronaut => {
                    if (astronaut.type === type && astronaut.destination === null) {
                        astronaut.destination = buildingId;
                        astronautsToTransport.push(astronaut);
                    }
                });
            }
        });

        // Mettre à jour le nombre d'astronautes dans le bâtiment
        building.numAstronauts -= astronautsToTransport.length;
    }

    return astronautsToTransport;
}
function construireCheminString(path: Transport[]): string {
    if (path.length === 0) {
        return '';
    }

    let chemin = [path[0].buildingId1];  // Commencer par le premier bâtiment

    for (const segment of path) {
        chemin.push(segment.buildingId2);  // Ajouter le bâtiment de destination pour chaque segment
    }

    return chemin.join(' ');  // Convertir le tableau en string séparé par des espaces
}


// 1. Capacité des routes
// 2. Trafic sur la route
// 3. Répartition des arrêts (stops)
// 4. Optimisation des trajets
// 5. Coût de création d'un pod
// 6. Chemin le plus court (Dijkstra)
// 7. Planification des hubs de transport
// 8. Ajout de pods circulaires
// 9. Planification par quartier ou zone
// to do
function gestionResteAstronautesOnLunarModule() {
    let idPod = pods.length > 0 ? pods[pods.length - 1].podId : 0;

    LandingZoneMap.forEach((landingzone: Building) => {
        const typeCache: Map<number, Transport[]> = new Map(); // Cache pour éviter des calculs répétés des chemins par type

        landingzone.astronautTypes.forEach((type: number) => {
            if (!typeCache.has(type)) {
                const path = trouverModuleLunaireProcheByTypes(landingzone.buildingId, type);
                if (path !== undefined) {
                    typeCache.set(type, path);  // Stocke le chemin calculé pour éviter les répétitions
                }
            }

            const path = typeCache.get(type);
            if (path && path.length > 0) {
                let routeForType: MagneticTube[] = [];

                // Filtre les tubes qui correspondent au chemin
                getListTube().forEach((tube: MagneticTube) => {
                    if (path.some((transport: Transport) =>
                        (tube.buildingId1 === transport.buildingId1 && tube.buildingId2 === transport.buildingId2) ||
                        (tube.buildingId1 === transport.buildingId2 && tube.buildingId2 === transport.buildingId1))) {
                        routeForType.push(tube);
                    }
                });

                // Si toutes les routes du chemin sont valides
                if (routeForType.length === path.length) {
                    const podTowardsLunarModule = embarquerAstronautesDansPod(
                        landingzone.buildingId,
                        newBuildingsMap.get(path[path.length - 1].buildingId2)?.buildingId!
                    );

                    const stopsTemp: number[] = path.flatMap(a => [a.buildingId1, a.buildingId2]);

                    let pod: Pod = {
                        podId: idPod + 1,
                        numStops: stopsTemp.length,
                        stops: stopsTemp,
                        astronauts: podTowardsLunarModule
                    };

                    // Vérification des doublons de pod et de capacité des routes
                    let isExist = pods.some(p => JSON.stringify(p.stops) === JSON.stringify(pod.stops));
                    let noMoreCapacity = false;

                    routeForType.forEach(route => {
                        if (route.pods.length >= route.capacity) {
                            noMoreCapacity = true;
                            route = upgradeTube(route);  // Augmenter la capacité du tube si nécessaire
                        }
                    });

                    // Ajout du pod si les conditions sont remplies
                    if (!isExist && hasSufficientResources(POD_RESSOURCE) && !noMoreCapacity) {
                        idPod++;
                        pods.push(pod);
                        routeForType.forEach(route => {
                            route.pods.push(pod);
                            podsList.push(route);
                        });

                        actions.push({
                            type: typeAction.POD,
                            details: `${idPod} ${construireCheminString(path)}`
                        });
                        resources.totalResources! -= POD_RESSOURCE;
                    }
                }
            }
        });
    });

    LunarModuleMap.forEach((module: LunarModule) => {
        const typeCache: Map<number, Transport[]> = new Map(); // Cache pour éviter des calculs répétitifs
        console.error("module",module)
        module.astronautTypes.forEach((type: number) => {
            if (type !== module.moduleType) {
                // Vérifie si le chemin pour ce type a déjà été calculé
                if (!typeCache.has(type)) {
                    const path = trouverModuleLunaireProcheByTypes(module.buildingId, type);
                    if (path) {
                        typeCache.set(type, path); // Stocker dans le cache
                    }
                }

                const path = typeCache.get(type);
                if (path && path.length > 0) {
                    const lastSegment = path[path.length - 1];
                    const routeForType = getListTube().find(tube =>
                        (tube.buildingId1 === module.buildingId && tube.buildingId2 === lastSegment.buildingId2) ||
                        (tube.buildingId2 === module.buildingId && tube.buildingId1 === lastSegment.buildingId2)
                    );

                    if (routeForType) {
                        // console.error("routeForType", routeForType);
                        // console.error("construireCheminString(path)", construireCheminString(path));

                        const podTowardsLunarModule = embarquerAstronautesDansPod(
                            module.buildingId,
                            newBuildingsMap.get(lastSegment.buildingId2)?.buildingId!
                        );

                        const stopsTemp = path.flatMap(segment => [segment.buildingId1, segment.buildingId2]);

                        const pod: Pod = {
                            podId: idPod + 1,
                            numStops: stopsTemp.length,
                            stops: stopsTemp,
                            astronauts: podTowardsLunarModule
                        };

                        

                        // Utilisation de `some` pour vérifier rapidement l'existence du pod
                        const isExist = pods.some(existingPod => JSON.stringify(existingPod.stops) === JSON.stringify(pod.stops));

                        if (!isExist && hasSufficientResources(POD_RESSOURCE)) {
                            idPod++;
                            pods.push(pod);
                            actions.push({
                                type: typeAction.POD,
                                details: `${idPod} ${construireCheminString(path)}`
                            });
                            resources.totalResources! -= POD_RESSOURCE;
                        }
                    }
                }
            }
        });
    });
}

function trouverModuleLunaireProcheByTypes(buildingId: number, type: number): Transport[] | undefined {
    const path: Transport[] | undefined = dijkstraToLunarModuleWithType(buildingId, type)?.path;
    if(path){
        return path
    }
    return undefined
}

function trouverModuleLunaireProcheByTypesAndRoutes(buildingId: number, type: number, routes: Transport[]): Transport[] | undefined {
    const path: Transport[] | undefined = dijkstraToLunarModuleWithTypeAndRoutes(buildingId, type,routes)?.path;
    if(path){
        return path
    }
    return undefined
}

function dijkstraToLunarModuleWithType(startBuildingId: number, targetModuleType: number): { path: Transport[], cost: number } | null {
    const distances: { [key: number]: number } = {};
    const previous: { [key: number]: number | null } = {};
    const visited: Set<number> = new Set();
    const pq: { buildingId: number, cost: number }[] = [];

    // Initialisation des distances
    for (const building of newBuildings) {
        distances[building.buildingId] = Infinity;
        previous[building.buildingId] = null;
    }
    distances[startBuildingId] = 0;

    pq.push({ buildingId: startBuildingId, cost: 0 });

    while (pq.length > 0) {
        // Extraire le nœud avec la plus petite distance
        pq.sort((a, b) => a.cost - b.cost);
        const { buildingId: currentBuildingId, cost } = pq.shift()!;
        
        // Si ce bâtiment a déjà été visité, on passe au suivant
        if (visited.has(currentBuildingId)) continue;
        visited.add(currentBuildingId);

        // Vérifier si le bâtiment courant est un module lunaire du bon type
        const currentBuilding = newBuildingsMap.get(currentBuildingId);
        if (currentBuilding && (currentBuilding as LunarModule).moduleType === targetModuleType) {
            // Reconstituer le chemin depuis startBuildingId jusqu'à ce module lunaire
            const path: Transport[] = [];
            let current = currentBuildingId;
            while (previous[current] !== null) {
                const prevBuildingId = previous[current]!;
                path.push({
                    buildingId1: prevBuildingId,
                    buildingId2: current,
                    capacity: 1
                });
                current = prevBuildingId;
            }

            return { path: path.reverse(), cost: distances[currentBuildingId] };
        }

        // Explorer les voisins (routes de transport)
        for (const neighbor of transportRoutes) {
            if (neighbor.buildingId1 === currentBuildingId || neighbor.buildingId2 === currentBuildingId) {
                const neighborBuildingId = neighbor.buildingId1 === currentBuildingId ? neighbor.buildingId2 : neighbor.buildingId1;
                const newCost = cost + calculDistanceTub(newBuildingsMap.get(currentBuildingId)!, newBuildingsMap.get(neighborBuildingId)!);

                if (newCost < distances[neighborBuildingId]) {
                    distances[neighborBuildingId] = newCost;
                    previous[neighborBuildingId] = currentBuildingId;
                    pq.push({ buildingId: neighborBuildingId, cost: newCost });
                }
            }
        }
    }

    return null;  // Aucun module lunaire du bon type n'a été trouvé
}

function dijkstraToLunarModuleWithTypeAndRoutes(startBuildingId: number, targetModuleType: number, routes: Transport[]): { path: Transport[], cost: number } | null {
    const distances: { [key: number]: number } = {};
    const previous: { [key: number]: number | null } = {};
    const visited: Set<number> = new Set();
    const pq: { buildingId: number, cost: number }[] = [];

    // Initialisation des distances
    for (const building of newBuildings) {
        distances[building.buildingId] = Infinity;
        previous[building.buildingId] = null;
    }
    distances[startBuildingId] = 0;

    pq.push({ buildingId: startBuildingId, cost: 0 });

    while (pq.length > 0) {
        // Extraire le nœud avec la plus petite distance
        pq.sort((a, b) => a.cost - b.cost);
        const { buildingId: currentBuildingId, cost } = pq.shift()!;
        
        // Si ce bâtiment a déjà été visité, on passe au suivant
        if (visited.has(currentBuildingId)) continue;
        visited.add(currentBuildingId);

        // Vérifier si le bâtiment courant est un module lunaire du bon type
        const currentBuilding = newBuildingsMap.get(currentBuildingId);
        if (currentBuilding && (currentBuilding as LunarModule).moduleType === targetModuleType) {
            // Reconstituer le chemin depuis startBuildingId jusqu'à ce module lunaire
            const path: Transport[] = [];
            let current = currentBuildingId;
            while (previous[current] !== null) {
                const prevBuildingId = previous[current]!;
                path.push({
                    buildingId1: prevBuildingId,
                    buildingId2: current,
                    capacity: 1
                });
                current = prevBuildingId;
            }

            return { path: path.reverse(), cost: distances[currentBuildingId] };
        }

        // Explorer les voisins (routes de transport)
        for (const neighbor of routes) {
            if (neighbor.buildingId1 === currentBuildingId || neighbor.buildingId2 === currentBuildingId) {
                const neighborBuildingId = neighbor.buildingId1 === currentBuildingId ? neighbor.buildingId2 : neighbor.buildingId1;
                const newCost = cost + calculDistanceTub(newBuildingsMap.get(currentBuildingId)!, newBuildingsMap.get(neighborBuildingId)!);

                if (newCost < distances[neighborBuildingId]) {
                    distances[neighborBuildingId] = newCost;
                    previous[neighborBuildingId] = currentBuildingId;
                    pq.push({ buildingId: neighborBuildingId, cost: newCost });
                }
            }
        }
    }

    return null;  // Aucun module lunaire du bon type n'a été trouvé
}






function sortirActions() {
    // Sortie des actions (format attendu par le jeu)
    const actionString = actions.map(action => `${action.type} ${action.details}`).join(';');
    console.error('console envoyé :',actionString);
    if (actionString) {
        console.log(actionString);
    } else {
        console.log('WAIT');
    }

    actions = []; // Réinitialiser les actions pour le prochain tour
}


//#region constante
const TELEPORT_RESSOURCE: number = 5000;
const POD_RESSOURCE: number = 1000;
const LIMITE_DAYS: number = 20;
const LIMITE_MONTH: number = 20;
//#endregion

//#region variables globales
let actions: Action[] = [];

let newBuildings: Building[] = [];

let tubeCostList: ConstructionCost[] = [];
let transportRoutes: Transport[] = [];
let teleporterList: Building[] = [];

let podsList: MagneticTube[] = [];

let pods: Pod[] = [];

let resources: Resources = { totalResources: null };
let astronautMap: Map<number, Astronaut> = new Map();
let newBuildingsMap: Map<number, Building> = new Map();

let LunarModuleMap: Map<number, LunarModule> = new Map();
let LandingZoneMap: Map<number, Building> = new Map();

let numberOfMonth: number = 0;
let numberOfDays: number = 0;
//#endregion

while (numberOfMonth !== 20) {
    // Lecture des ressources disponibles
    resources.totalResources = +readline()
    console.error('resources', resources.totalResources)
    // console.error('readline',readline())
    // console.error('readline',readline())
    // console.error('readline',readline())
    addTransportRoute(true);
    addPods(true);
    addBuildings(true);
    

    // Remplir la map avec les bâtiments existants
    newBuildings.forEach(building => {
        newBuildingsMap.set(building.buildingId, building);
    });
    newBuildingsMap.forEach((building: Building) => {
        if((building as LunarModule)?.moduleType) {
            LunarModuleMap.set(building.buildingId, (building as LunarModule))
        }
        else {
            LandingZoneMap.set(building.buildingId, building)
        }
    })

    // console.error("newBuildings",newBuildings)
    console.error('transportRoutes 1', transportRoutes)
    
    // gestion des tubes et des teleporter
    gestionArrivee();

    gestionResteAstronautesOnLunarModule()

    gestionTraficEtUpgrade();
    // deplacerPods();

    
    numberOfDays++;
    if(numberOfDays === 20) {
        numberOfDays = 0;
        numberOfMonth++;
    }
    console.error('resources', resources.totalResources)
    sortirActions();
}


function readline(): string {
    throw new Error("Function not implemented.");
}

