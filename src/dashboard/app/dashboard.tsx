import * as React from "react";
import * as ReactDom from "react-dom";
import { MemoryRouter, Route, Redirect, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer, Slide } from "react-toastify";

import {
    DeviceList,
    DeviceView,
    Navbar,
    Sidebar,
    DeviceError,
    MainGrid,
    Settings,
    About,
} from "./components";
import { store } from "./store";
import { synchronizer } from "./lib/sync";

// import 'bulmaswatch/darkly/bulmaswatch.min.css'
// import "@fortawesome/fontawesome-free/js/fontawesome";
// import "@fortawesome/fontawesome-free/js/solid";
// import "@fortawesome/fontawesome-free/js/regular";
// import "@fortawesome/fontawesome-free/js/brands";

import "./styles/dashboard.scss";

import "react-toastify/dist/ReactToastify.css";

const App: React.FunctionComponent = () => {
    const _ = synchronizer; // XXX to force import?

    const CloseButton = (props: { closeToast: () => void }) => {
        return <button className="delete" onClick={props.closeToast} />;
    };

    return (
        <div>
            <Switch>
                <Route path={["/dashboard.html", "/device/:serial"]}>
                    <Navbar />
                </Route>
                <Route>
                    <Redirect to="/dashboard.html" />
                </Route>
            </Switch>
            <Route path="/device/:serial">
                <DeviceError />
            </Route>
            <Route path={["/dashboard.html", "/device/:serial"]}>
                <section className="columns mr-0 ml-0 is-fullheight">
                    <Sidebar />
                    <div className="is-main-content column">
                        <Switch>
                            <Route
                                path="/dashboard.html"
                                render={(props) => {
                                    return (
                                        <MainGrid.Grid {...props}>
                                            <DeviceList />
                                        </MainGrid.Grid>
                                    );
                                }}
                            />
                            <Route
                                path="/device/:serial"
                                render={(props: any) => {
                                    return (
                                        <MainGrid.Grid {...props}>
                                            <DeviceView
                                                key={props.match.params.serial}
                                                {...props}
                                            />
                                        </MainGrid.Grid>
                                    );
                                }}
                            />
                        </Switch>
                    </div>
                </section>
            </Route>
            <ToastContainer
                position="bottom-center"
                transition={Slide}
                hideProgressBar
                toastClassName="notification"
                closeButton={CloseButton}
            />
            <Settings />
            <About />
        </div>
    );
};

ReactDom.render(
    <Provider store={store}>
        <MemoryRouter>
            <App />
        </MemoryRouter>
    </Provider>,
    document.getElementById("app")
);
