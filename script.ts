// Déclaration des interfaces
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

interface Teleporter extends TransportRoute {
    // Les téléporteurs n'ont pas de capacité, ils sont instantanés
}

interface Resources {
    totalResources: number;
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
  
let actions: Action[] = [];
let newBuildings: Building[] = [];

while (true) {
    // Lecture des ressources disponibles
    const resources: Resources = {
        totalResources: parseInt(readline())
    };

    // Lecture des routes de transport existantes (tubes et téléporteurs)
    const numTravelRoutes: number = parseInt(readline());
    let transportRoutes: Transport[] = [];

    for (let i = 0; i < numTravelRoutes; i++) {
        const inputs: string[] = readline().split(' ');
        const buildingId1: number = parseInt(inputs[0]);
        const buildingId2: number = parseInt(inputs[1]);
        const capacity: number = parseInt(inputs[2]); // 0 -> téléporteur, sinon capacité du tube

        if (capacity === 0) {
            const teleporter: Teleporter = {
                buildingId1,
                buildingId2
            };
            transportRoutes.push(teleporter);
        } else {
            const tube: MagneticTube = {
                buildingId1,
                buildingId2,
                capacity
            };
            transportRoutes.push(tube);
        }
    }

    // Lecture des capsules existantes
    const numPods: number = parseInt(readline());
    let pods: Pod[] = [];
    
    for (let i = 0; i < numPods; i++) {
        const podProperties: string[] = readline().split(' ');
        const podId = parseInt(podProperties[0]);
        const numStops = parseInt(podProperties[1]);
        let stops: number[] = [];

        for (let j = 0; j < numStops; j++) {
            stops.push(parseInt(podProperties[2 + j])); // Stops commencent à partir du 3e élément
        }

        const pod: Pod = {
            podId,
            numStops,
            stops
        };

        pods.push(pod);
    }

    // Lecture des nouveaux bâtiments construits
    const numNewBuildings: number = parseInt(readline());
    
    for (let i = 0; i < numNewBuildings; i++) {
        const buildingProperties: string[] = readline().split(' ');

        if (parseInt(buildingProperties[0]) === 0) {  // Aire d'atterrissage
            const building: LandingZone = {
                buildingId: parseInt(buildingProperties[1]),
                coordX: parseInt(buildingProperties[2]),
                coordY: parseInt(buildingProperties[3]),
                numAstronauts: parseInt(buildingProperties[4]),
                astronautTypes: []
            };

            for (let j = 0; j < building.numAstronauts; j++) {
                building.astronautTypes.push(parseInt(buildingProperties[5 + j]));
            }

            newBuildings.push(building);
        } else {  // Module lunaire
            const building: LunarModule = {
                moduleType: parseInt(buildingProperties[0]),
                buildingId: parseInt(buildingProperties[1]),
                coordX: parseInt(buildingProperties[2]),
                coordY: parseInt(buildingProperties[3])
            };

            newBuildings.push(building);
        }
    }
    console.error('Debug messages... newBuildings',newBuildings);
    console.error('Debug messages... transportRoutes',transportRoutes);
    let listIdBuilding: number[] = []
    for(let building of newBuildings){
        listIdBuilding.push(building.buildingId)
    }
    console.error('Debug messages... listIdBuilding',listIdBuilding);

    console.error('Debug messages... newBuildings.length',newBuildings.length);
    // parcours tout les buildings avec 2 index
    for(let i = 0; i < newBuildings.length; i++){
        console.error('Debug messages... i',i);
        for(let y = 0; y < newBuildings.length; y++){
            console.error('Debug messages... y',y);
            let isCroise: boolean = false
            let isTeleporter: boolean = false

            
            let building1: Building | null = null; // 1er building du 1er tube
            let building2: Building | null = null; // 2eme building du 1er tube

            let building3: Building | null = null; // 1er building du 2eme tube
            let building4: Building | null = null; // 2eme building du 2eme tube

            // avant de caculé la distance verifié que aucun tube va se croisé
            if(transportRoutes.length > 0){
                for(let t1 = 0; t1 < transportRoutes.length; t1++){
                    const tubeVar = transportRoutes[t1]; // 1er tube
                    // récupération des id des 2 building du tube
                    const idbuilding1: number = tubeVar.buildingId1
                    const idbuilding2: number = tubeVar.buildingId2
                    for(let bu of newBuildings){
                        if(idbuilding1 && bu.buildingId === idbuilding1){
                            building1 = bu
                        }
                        if(idbuilding2 && bu.buildingId === idbuilding2){
                            building2 = bu
                        }
                    }
                    for(let t2 = 0; t2 < transportRoutes.length; t2++){
                        const tubeVar2 = transportRoutes[t2];
                        const idbuilding3: number | undefined = listIdBuilding.find(element => tubeVar2.buildingId1)
                        const idbuilding4: number | undefined = listIdBuilding.find(element => tubeVar2.buildingId2)
                        for(let bu of newBuildings){
                            if(idbuilding3 && bu.buildingId === idbuilding3){
                                building3 = bu
                            }
                            if(idbuilding4 && bu.buildingId === idbuilding4){
                                building4 = bu
                            }
                        }
                    }
                    console.error('Debug messages... building1',building1);
                    console.error('Debug messages... building2',building2);
                    console.error("building3",building3);
                    console.error("building4",building4);
        
                    if(
                        building1 ?? 
                        building2 ?? 
                        building3 ?? 
                        building4 
                    ) {
                        isTeleporter = true
                    }
                    else if(building1 !== null &&
                        building2 !== null && 
                        building3 !== null && 
                        building4 !== null && 
                        segmentsIntersect(building1, building2, building3, building4)){
                        isCroise = true
                    }
                }
                const distanceTubeCalc: number = calculDistanceTub(newBuildings[i],newBuildings[y]);
                if (resources.totalResources > distanceTubeCalc 
                    && newBuildings.length > 1 
                    && !isCroise && !isTeleporter 
                    && newBuildings[i].buildingId  && newBuildings[y].buildingId 
                    && newBuildings[i].buildingId !== newBuildings[y].buildingId) {
                    
                    actions.push({
                        type: typeAction.TUBE,
                        details: `TUBE ${building1} ${building2}`
                    });
                }
            }
            else {
                console.error('Debug messages... resources.totalResources',resources.totalResources);
                const distanceTubeCalc: number = calculDistanceTub(newBuildings[i],newBuildings[y]);
                console.error('Debug messages... distanceTubeCalc',distanceTubeCalc);
                if (resources.totalResources > distanceTubeCalc 
                    && newBuildings.length > 1 &&
                    newBuildings[i].buildingId  && newBuildings[y].buildingId 
                && newBuildings[i].buildingId !== newBuildings[y].buildingId) {
                    
                    actions.push({
                        type: typeAction.TUBE,
                        details: `${newBuildings[i].buildingId} ${newBuildings[y].buildingId}`
                    });
                }
            }
        }
    }

    

    function calculDistanceTub(b1: Building, b2: Building): number{
        return (b2.coordX - b1.coordX) * 2 + (b2.coordY - b2.coordY)
    }

    
    function sign(x:number): number{
        if(x < 0) return -1
        if(x === null) return 0
        return 1
    }

    function orientationFun(p1: Building, p2: Building, p3: Building): number {
        const prod = (p3.coordY-p1.coordY) * (p2.coordX-p1.coordX) - (p2.coordY-p1.coordY) * (p3.coordX-p1.coordX)
        return sign(prod)
    }
    
    function segmentsIntersect(A: Building, B: Building, C: Building, D: Building): boolean {
        return orientationFun(A, B, C) * orientationFun(A, B, D)! < 0 && orientationFun(C, D, A)! * orientationFun(C, D, B)! < 0
    }
    console.error('Debug messages... actions',actions);

    // Sortie des actions (format attendu par le jeu)
    const actionString = actions.map(action => `${action.type} ${action.details}`).join(';');
    if (actionString) {
        console.log(actionString);
    } else {
        console.log('WAIT');
    }

    actions = []; // Réinitialiser les actions pour le prochain tour
}


function readline(): string {
    throw new Error("Function not implemented.");
}

