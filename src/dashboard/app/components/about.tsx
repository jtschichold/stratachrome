import * as React from "react";
import {
    connect,
    MapDispatchToPropsFunction,
    MapStateToProps,
} from "react-redux";
import { State as StoreState, actions } from "../store";
import { Icon } from "../images";

export interface AboutState {
    isActive: boolean;
}

interface AboutOwnProps extends AboutState {}

interface AboutDispatchProps {
    deactivateAbout?: () => void;
}

export const InternalAbout: React.FunctionComponent<
    AboutOwnProps & AboutDispatchProps
> = (props) => {
    let { isActive, deactivateAbout } = props;
    const [display, setDisplay] = React.useState(false);

    React.useEffect(() => {
        if (isActive && !display) {
            setDisplay(true);
            return;
        }

        if (!isActive && display) {
            setDisplay(false);
            return;
        }
    }, [isActive]);

    const onCancel = () => {
        deactivateAbout();
    };

    return (
        <div style={{}} className={`modal ${display ? "is-active" : ""}`}>
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <div className="modal-card-title">About</div>
                    <button
                        className="delete is-medium"
                        aria-label="close"
                        onClick={onCancel}
                    ></button>
                </header>
                <section className="modal-card-body">
                    <div className="is-flex">
                        <div className="about-icon has-text-link">
                            <Icon.AlessiaFull />
                        </div>
                        <div className="about-text">
                            <h3>Pan(w)achrome</h3>
                            <h5>Version 0.8.0-beta.1</h5>
                            <h5>
                                Copyright &copy; 2020 Luigi Mori
                                &lt;panwachrome@isidora.org&gt;
                            </h5>
                            <h5>
                                <span className="mr-2">Support</span>
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://www.pangurus.com/forum/panachrome"
                                >
                                    https://www.pangurus.com/forum/panachrome
                                </a>
                            </h5>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const mapDispatchToProps: MapDispatchToPropsFunction<AboutDispatchProps, {}> = (
    dispatch
) => {
    return {
        deactivateAbout: () =>
            dispatch(actions.state.upsert("aboutState", false)),
    };
};

const mapStateToProps: MapStateToProps<
    AboutState,
    AboutOwnProps,
    StoreState
> = (state: StoreState, props: AboutOwnProps) => {
    return {
        isActive: state.session.find(({ key, value }) => key === "aboutState")
            ?.value,
    };
};

export const About = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalAbout);
