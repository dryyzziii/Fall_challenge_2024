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

interface Graph {
    [key: number]: { buildingId: number, distance: number }[]; // Chaque bâtiment a une liste de ses voisins et des distances
}

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
    let transportRouteMagnetic = getListTube();
    transportRouteMagnetic.forEach(route => {
        let trafficCount = calculerTraficSurRoute(route);  // Calcule le nombre d'astronautes sur cette route
        // console.error("trafficCount", trafficCount)
        // console.error("route.capacity * 10", route.capacity * 10)

        // * 10 car un pods transport 10 astronautes
        if (trafficCount > route.capacity * 10) {
            // console.error("update commencé")
            upgradeTube(route);
        }
    });
}

function calculerTraficSurRoute(route: MagneticTube): number {
    let trafficCount = 0;
    let numberOfPod = 0;
    // console.error("route", route)
    podsList.forEach((podRoute: MagneticTube) => {
        // console.error("podRoute", podRoute)
        if
        (
            (podRoute.buildingId1 == route.buildingId1 && podRoute.buildingId2 == podRoute.buildingId2) || 
            (podRoute.buildingId2 == route.buildingId1 && podRoute.buildingId1 == podRoute.buildingId2)
        ){
            numberOfPod++;
        }
    })
    trafficCount = 10 * numberOfPod;
    return trafficCount;
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
    let tubeToUpgrade: MagneticTube | undefined;

    for (let i = 0; i < transportRoutes.length; i++) {
        const tr1 = transportRoutes[i] as MagneticTube;
        // Chercher deux tubes avec les mêmes bâtiments, mais des capacités différentes
        if (
            (tr1.buildingId1 === route.buildingId1 &&
            tr1.buildingId2 === route.buildingId2) || 
            (tr1.buildingId2 === route.buildingId1 &&
                tr1.buildingId1 === route.buildingId2)
        ) {
            tubeToUpgrade = tr1;   // Stocker le tube avec la nouvelle capacité
            newCapacity = tr1.capacity + 1; // Stocker la nouvelle capacité
            break;
        }
        // Sortir de la boucle si le tube à upgrader est trouvé
        if (tubeToUpgrade && newCapacity !== 0) {
            break;
        }
    }

    // console.error('newCapacity', newCapacity);
    // console.error('tubeToUpgrade', tubeToUpgrade);
    // Vérifier si on a trouvé un tube à upgrader et si la nouvelle capacité est valide
    if (tubeToUpgrade && newCapacity !== 0) {
        // Calculer le coût de l'upgrade
        let building1: Building | undefined;
        let building2: Building | undefined;
        newBuildingsMap.forEach((building: Building) => {
            if(building.buildingId == tubeToUpgrade.buildingId1){
                building1 = building
            }
            if(building.buildingId == tubeToUpgrade.buildingId2){
                building2 = building
            }
        })
        const newCost = calculDistanceTub(building1!, building2!) * newCapacity;
        // console.error('newCost', newCost);
        // console.error('resources.totalResources',resources.totalResources)

        // Vérifier si on a suffisamment de ressources pour effectuer l'upgrade
        if (hasSufficientResources(newCost)) {

            const tubeList = getListTube();
            tubeList.forEach((tube: MagneticTube) => {
                if(tube === tubeToUpgrade){
                    tube.capacity = newCapacity
                }
            })
            // Ajouter l'action d'upgrade
            actions.push({
                type: typeAction.UPGRADE,
                details: `${tubeToUpgrade.buildingId1} ${tubeToUpgrade.buildingId2}`
            });
            resources.totalResources! -= newCost!;

            console.error('Tube upgraded:', tubeToUpgrade.buildingId1, tubeToUpgrade.buildingId2);
        }
    }
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
                        console.error('Mise à niveau du tube');
                        // upgradeTube(); // Appel de la fonction de mise à niveau
                    }
                    break; // Sortir de la boucle si la route est trouvée
                }
            }

            // Si aucune route n'existe encore, ajouter une nouvelle route
            if (!routeExists) {
                const route = capacity === 0
                    ? { buildingId1, buildingId2 } as Teleporter // Création d'un téléporteur
                    : { buildingId1, buildingId2, capacity } as MagneticTube; // Création d'un tube magnétique

                // console.error('Nouvelle route ajoutée :', route);
                transportRoutes.push(route); // Ajout de la nouvelle route
            }
        }
    } else {
        const route = capacity === 0
            ? { buildingId1, buildingId2 } as Teleporter // Création d'un téléporteur
            : { buildingId1, buildingId2, capacity } as MagneticTube; // Création d'un tube magnétique

        transportRoutes.push(route); // Ajout de la nouvelle route
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

function gestionTubeTeleporter() {
    let arretes = kruskalMST()
    arretes.routes.forEach((transport: Transport) => {
        const building1 = newBuildingsMap.get(transport.buildingId1)!
        const building2 = newBuildingsMap.get(transport.buildingId2)!
        if(!transportRoutes?.some(a => a.buildingId1 == building1.buildingId && a.buildingId2 == building2.buildingId)){
            // Calculer le coût d'un tube magnétique
            let tubeCost = calculDistanceTub(building1, building2);
                
            // Vérifier si un téléporteur serait moins cher
            if (tubeCost > TELEPORT_RESSOURCE) {
                console.error("Vérifier si un téléporteur serait moins cher")
                
                // Si le téléporteur est moins cher, construire un téléporteur
                if (
                    !teleporterExists(building1.buildingId, building2.buildingId) &&
                    hasSufficientResources(TELEPORT_RESSOURCE)
                ) {
                    actions.push({
                        type: typeAction.TELEPORT,
                        details: `${building1.buildingId} ${building2.buildingId}`
                    });
                    resources.totalResources! -= TELEPORT_RESSOURCE;
                }
            } else {
                let interfaceTubeExistant: boolTubeExistant = { isCroise: false, isOnBuilding: false }
                interfaceTubeExistant = verificationTubeExistant(building1, building2)
                // console.error("interfaceTubeExistant",interfaceTubeExistant)
                // Sinon, ajouter des tubes magnétiques
                if (
                    hasSufficientResources(tubeCost) &&
                    !tubeExists(building1.buildingId, building2.buildingId) &&
                    !tubeCostList.some(a => 
                        (a.buildingid1 === building1.buildingId && a.buildingid2 === building2.buildingId) || 
                        (a.buildingid1 === building2.buildingId && a.buildingid2 === building1.buildingId)) &&
                    !interfaceTubeExistant.isOnBuilding &&
                    !interfaceTubeExistant.isCroise
                    ) {
                    addTubeCost(tubeCost, building1.buildingId, building2.buildingId)
                    addTransportRoute(false,1,building1.buildingId,building2.buildingId);
                    actions.push({
                        type: typeAction.TUBE,
                        details: `${building1.buildingId} ${building2.buildingId}`
                    });
                    resources.totalResources! -= tubeCost;
                }
            }
        }
        
        
    })
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
function gestionPodsAndCapacity() {
    const TubeTransportRoutes: MagneticTube[] = getListTube();
    let idPod = pods.length > 0 ? pods[pods.length - 1].podId : 0;


    for (let route of TubeTransportRoutes) {
        let isExist = false;
        for (let pod of podsList) {
            if (
                (pod.buildingId1 === route.buildingId1 && pod.buildingId2 === route.buildingId2) || 
                (pod.buildingId1 === route.buildingId2 && pod.buildingId2 === route.buildingId1)
            ) {
                isExist = true;
                break;  // Arrêter la boucle dès qu'un pod est trouvé
            }
        }
        
        const building1: Building = newBuildingsMap.get(route.buildingId1)!
        const building2: Building = newBuildingsMap.get(route.buildingId2)!
        console.error("building1", building1)
        // 
        if(building1.astronautTypes.length !== 0){
            // console.error('building1.astronautTypes.length', building1.astronautTypes.length)
            building1.astronautTypes.forEach((type: number) => {
                // console.error("type", type)
                // console.error("type", (building2 as LunarModule).moduleType)
                if((building2 as LunarModule)?.moduleType && (building2 as LunarModule).moduleType == type){
                    if 
                    (
                        hasSufficientResources(POD_RESSOURCE) &&
                        !podsList.some(a => {
                            a.buildingId1 == building1.buildingId && a.buildingId2 == building1.buildingId ||
                            a.buildingId2 == building1.buildingId && a.buildingId1 == building1.buildingId
                        })
                    ) {
                        idPod++; 
                        podsList.push(route);
                        actions.push({
                            type: typeAction.POD,
                            details: `${idPod} ${building1.buildingId} ${building2.buildingId}`
                        });
                        resources.totalResources! -= POD_RESSOURCE;
                    }
                }
            })
        }
        else if(building2.astronautTypes.length !== 0){
            building2.astronautTypes.forEach((type: number) => {
                // console.error("type", type)
                // console.error("type", (building2 as LunarModule).moduleType)
                if((building1 as LunarModule)?.moduleType && (building1 as LunarModule).moduleType == type){
                    if 
                    (
                        hasSufficientResources(POD_RESSOURCE) &&
                        !podsList.some(a => {
                            a.buildingId1 == building2.buildingId && a.buildingId2 == a.buildingId2 ||
                            a.buildingId2 == building2.buildingId && a.buildingId1 == a.buildingId2
                        })
                    ) {
                        idPod++; 
                        podsList.push(route);
                        actions.push({
                            type: typeAction.POD,
                            details: `${idPod} ${building1.buildingId} ${building2.buildingId}`
                        });
                        resources.totalResources! -= POD_RESSOURCE;
                    }
                }
            })
        }

        // S'il y a suffisamment de trafic et des ressources disponibles
        // if (hasSufficientResources(POD_RESSOURCE)) {
        //     idPod++;
        //     let stops = pathCourt.join(' ');  // Créer les arrêts à partir du chemin court
        //     podsList.push(route);
        //     actions.push({
        //         type: typeAction.POD,
        //         details: `${idPod} ${stops}`
        //     });
        //     resources.totalResources! -= POD_RESSOURCE;
        // }


        // Si un pod n'existe pas encore sur cette route, et qu'il y a du trafic, on ajoute un pod
        // console.error("getNumberOfPods", getNumberOfPods(route))
        // if (!isExist || getNumberOfPods(route) < route.capacity) {
        //     // let distances = dijkstra(route.buildingId1);

        //     // const { distance, path } = distances[route.buildingId2];
        //     // let pathCourt: number[] = path;

        //     if (pathCourt.length > 1) { 


        //         
        //     }
        // }
        
    }
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

    // console.error("newBuildings",newBuildings)
    // console.error('transportRoutes', transportRoutes)
    
    // gestion des tubes et des teleporter
    gestionTubeTeleporter();
    gestionPodsAndCapacity()
    gestionTraficEtUpgrade();

    
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
