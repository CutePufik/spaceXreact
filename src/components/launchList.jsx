function LaunchList(props) {
    const {launchpads = [], activePadId, onHover} = props;

    return (
        <aside className="aside" id="launchesContainer">
            <h3>Launches</h3>
            <div id="listContainer">
                <ul>
                    {launchpads.flatMap(pad =>
                        (pad.launches ?? []).map((name, index) => (
                            <li
                                key={`${pad.id}-${index}`}
                                className={`launch${activePadId === pad.id ? " active" : ""}`}
                                data-launchpad-id={pad.id}
                                onMouseEnter={() => onHover(pad.id)}
                                onMouseLeave={() => onHover(null)}
                            >
                                {name}
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </aside>
    )
}

export {LaunchList}
