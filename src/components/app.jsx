import {LaunchList} from "./launchList";
import {Map} from "./map";
import {useEffect, useState} from "react";
import {SpaceX} from "../api/spacex";

function App(){

    const [launchpads, setLaunchpads] = useState([]);
    const [activePadId, setActivePadId] = useState(null);
    const spacex = new SpaceX();
    useEffect(()=>{
        spacex.launchpads()
            .then(data => setLaunchpads(data))
            .catch(err => console.error("Failed to load launchpads:", err));
    },[])

    return(
        <main className='main'>
            <LaunchList
                launchpads={launchpads}
                activePadId={activePadId}
                onHover={setActivePadId}
            />
            <Map launchpads={launchpads} activePadId={activePadId}/>
        </main>
    )
}

export {App};
