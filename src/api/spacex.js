const SPACEX_AGENCY_ID = 121;

function isSpaceXLaunch(launch) {
    const lsp = launch?.launch_service_provider;
    if (!lsp) return false;
    return lsp.id === SPACEX_AGENCY_ID || /spacex/i.test(lsp.name ?? "");
}

function isSpaceXPad(pad) {
    if (!pad) return false;
    if (Array.isArray(pad.agencies) && pad.agencies.some(
        a => a?.id === SPACEX_AGENCY_ID || /spacex/i.test(a?.name ?? "")
    )) {
        return true;
    }
    // Already-normalized pad from our API (has launches list, no agencies)
    return Array.isArray(pad.launches);
}

function hasCoords(pad) {
    const lat = Number(pad?.latitude);
    const lon = Number(pad?.longitude);
    return Number.isFinite(lat) && Number.isFinite(lon);
}

/** Unique pads used by SpaceX launches (incl. historical, e.g. Omelek / Kwajalein). */
function padsFromLaunches(launches) {
    const byPad = new Map();

    for (const launch of launches) {
        if (!isSpaceXLaunch(launch)) continue;

        const pad = launch.pad;
        if (!pad?.id || !hasCoords(pad)) continue;

        const id = String(pad.id);
        let entry = byPad.get(id);
        if (!entry) {
            entry = {
                id,
                name: pad.name,
                latitude: Number(pad.latitude),
                longitude: Number(pad.longitude),
                launches: [],
            };
            byPad.set(id, entry);
        }
        if (launch.name) entry.launches.push(launch.name);
    }

    return [...byPad.values()];
}

function normalizePads(pads) {
    return pads
        .filter(p => p?.id != null && hasCoords(p) && isSpaceXPad(p))
        .map(p => ({
            id: String(p.id),
            name: p.name,
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
            launches: Array.isArray(p.launches) ? p.launches : [],
        }));
}

class SpaceX{

    constructor(baseUrl = "http://localhost:8000/") {
        this.baseUrl = baseUrl;
    }

    launches(){
        return fetch(`${this.baseUrl}launches`)
            .then(response=>response.json());
    }

    launchpads(){
        return fetch(`${this.baseUrl}launchpads`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                // { launchpads: [...] } — filter to SpaceX pads with coords
                if (Array.isArray(data?.launchpads)) {
                    return normalizePads(data.launchpads);
                }
                // Launch Library: { results: [launches...] }
                if (Array.isArray(data?.results)) {
                    const first = data.results[0];
                    // results may be launches (have .pad) or pads (have .latitude)
                    if (first?.pad) {
                        return padsFromLaunches(data.results);
                    }
                    return normalizePads(data.results);
                }
                if (Array.isArray(data)) {
                    if (data[0]?.pad) return padsFromLaunches(data);
                    return normalizePads(data);
                }
                return [];
            });
    }

    launchpad(id){
        return fetch(`${this.baseUrl}launchpads/${id}`)
            .then(response=>response.json());
    }

    starlinks(){
        return fetch(`${this.baseUrl}starlink`)
            .then(response=>response.json());
    }
}

export {SpaceX}
