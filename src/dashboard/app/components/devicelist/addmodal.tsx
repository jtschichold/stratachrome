import * as React from "react";
import { Formik, FormikProps, FormikErrors } from "formik";
import { Command } from "../../../../common/models";

interface Props {
    isActive: boolean;
    onCancel: () => void;
    onAdd: () => void;
}

interface State {
    useAPIKey: boolean;
    isAdding: boolean;
    addError: string | null;
}

interface FormValues {
    url: string;
    user: string;
    password: string;
    apiKey: string;
}

export class AddModal extends React.Component<Props, State> {
    state: State = {
        useAPIKey: false,
        isAdding: false,
        addError: null,
    };

    shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
        if (this.state.useAPIKey !== nextState.useAPIKey) return true;
        if (this.state.addError !== nextState.addError) return true;
        if (this.state.isAdding !== nextState.isAdding) return true;

        if (this.props.isActive !== nextProps.isActive) return true;
        if (this.props.onAdd !== nextProps.onAdd) return true;
        if (this.props.onCancel !== nextProps.onCancel) return true;

        return false;
    }

    render() {
        let { isActive } = this.props;

        return (
            <div className={`modal ${isActive ? "is-active" : ""}`}>
                <div className="modal-background"></div>
                <Formik
                    initialValues={{
                        url: "",
                        user: "",
                        password: "",
                        apiKey: "",
                    }}
                    validate={this.validate}
                    onSubmit={this.onSubmit}
                >
                    {(props) => this.renderModalCard(props)}
                </Formik>
            </div>
        );
    }

    private onSubmit = () => {};

    private renderModalCard(props: FormikProps<FormValues>) {
        let { onCancel, onAdd } = this.props;
        let {
            handleChange,
            handleBlur,
            errors,
            values,
            validateForm,
            isValid,
        } = props;
        let { useAPIKey, isAdding, addError } = this.state;
        let selectValue = useAPIKey ? "apikey" : "userpwd";

        return (
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add Device</p>
                    <button
                        className="delete is-medium"
                        aria-label="close"
                        onClick={onCancel}
                    ></button>
                </header>
                <section className="modal-card-body">
                    <div
                        className={`notification is-danger ${
                            addError ? "" : "is-hidden"
                        }`}
                    >
                        <button
                            className="delete"
                            onClick={() => {
                                this.setState({
                                    ...this.state,
                                    addError: null,
                                });
                            }}
                        ></button>
                        {addError}
                    </div>
                    <form>
                        <div className="field">
                            <label className="label">
                                Firewall Management URL
                            </label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder=""
                                    value={values.url}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    name="url"
                                />
                            </div>
                            {errors.url && (
                                <p className="help is-danger">{errors.url}</p>
                            )}
                        </div>
                        <div className="field">
                            <label className="label">Credentials</label>
                            <div className="control">
                                <div className="select">
                                    <select
                                        onChange={(event) => {
                                            this.changeUseAPIKey(
                                                event.target.value
                                            );
                                            setTimeout(validateForm, 0);
                                        }}
                                        value={selectValue}
                                    >
                                        <option value="userpwd">
                                            Username/Password
                                        </option>
                                        <option value="apikey">API Key</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div
                            className={`field ${useAPIKey ? "is-hidden" : ""}`}
                        >
                            <label className="label">Username</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder=""
                                    value={values.user}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    name="user"
                                />
                            </div>
                            {errors.user && (
                                <p className="help is-danger">{errors.user}</p>
                            )}
                        </div>
                        <div
                            className={`field ${useAPIKey ? "is-hidden" : ""}`}
                        >
                            <label className="label">Password</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="password"
                                    placeholder=""
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    name="password"
                                />
                            </div>
                            {errors.password && (
                                <p className="help is-danger">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                        <div
                            className={`field ${useAPIKey ? "" : "is-hidden"}`}
                        >
                            <label className="label">API Key</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="password"
                                    placeholder=""
                                    value={values.apiKey}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    name="apiKey"
                                />
                            </div>
                            {errors.apiKey && (
                                <p className="help is-danger">
                                    {errors.apiKey}
                                </p>
                            )}
                        </div>
                    </form>
                </section>
                <footer className="modal-card-foot">
                    <button className="button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="button is-primary"
                        disabled={!isValid || isAdding}
                        onClick={() => this.addDevice(values, validateForm)}
                    >
                        <span>Add</span>
                        <span className={`icon ${isAdding ? "" : "is-hidden"}`}>
                            <i className="fas fa-spinner fa-pulse is-pulled-right"></i>
                        </span>
                    </button>
                </footer>
            </div>
        );
    }

    private addDevice = (
        values: FormValues,
        validate: () => Promise<FormikErrors<FormValues>>
    ) => {
        validate().then((errors) => {
            if (errors.apiKey || errors.password || errors.url || errors.user) {
                return;
            }

            this.setState({
                ...this.state,
                isAdding: true,
            });
            this.requestAddDevice(values, this.state.useAPIKey)
                .then(
                    (response) => {
                        this.props.onAdd();
                    },
                    (reason) => {
                        this.setState({ ...this.state, addError: "" + reason });
                    }
                )
                .finally(() =>
                    this.setState({ ...this.state, isAdding: false })
                );
        });
    };

    private changeUseAPIKey(newValue: string) {
        this.setState({
            ...this.state,
            useAPIKey: newValue === "apikey",
        });
    }

    private requestAddDevice(
        values: FormValues,
        useAPIKey: boolean
    ): Promise<any> {
        let cmd: Command = {
            cmd: "adddevice",
            url: values.url,
        };

        if (useAPIKey) {
            cmd.apiKey = values.apiKey;
        } else {
            cmd.user = values.user;
            cmd.password = values.password;
        }

        return new Promise<any>((resolve, reject) => {
            chrome.runtime.sendMessage(cmd, (response) => {
                if (!response) {
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                if (response.result) {
                    resolve(response.result);
                } else {
                    reject(response.error);
                }
            });
        });
    }

    private validate = (values: FormValues): FormikErrors<FormValues> => {
        let errors: FormikErrors<FormValues> = {};

        if (!values.url) {
            errors.url = "Required";
        } else {
            try {
                let url = new URL(values.url);
            } catch (e) {
                errors.url = "Invalid URL";
            }
        }

        if (this.state.useAPIKey) {
            if (!values.apiKey) {
                errors.apiKey = "Required";
            }
        } else {
            if (!values.user) {
                errors.user = "Required";
            }
            if (!values.password) {
                errors.password = "Required";
            }
        }

        setTimeout(() => {
            this.setState({ ...this.state, addError: null });
        }, 0);

        return errors;
    };
}
