import * as React from "react";
import orderBy from "lodash/orderBy";
import Alessia from "../../images/DeepSeaDiver";

interface DropdownSelectOption {
    name: string;
    value: any;
    group?: string;
}

export interface DropdownSelectProps {
    value: any;
    onChange: (value: any) => void;
    isRight: boolean;
    options: DropdownSelectOption[];
    icon?: string;
    mega?: boolean;
    filterEnabled?: boolean;
}

interface State {
    isActive: boolean;
    filter: string;
}

export class DropdownSelect extends React.Component<
    DropdownSelectProps,
    State
> {
    private menuRef: React.RefObject<HTMLDivElement> = React.createRef();

    state: State = {
        isActive: false,
        filter: "",
    };

    componentWillUnmount() {
        window.removeEventListener("mousedown", this.windowClickListener);
        this.menuRef = null;
    }

    render() {
        let {
            value,
            isRight,
            options,
            onChange,
            icon,
            mega,
            filterEnabled,
        } = this.props;
        let { isActive, filter } = this.state;

        let selected = options.find((o) => o.value === value);
        let groupNames: string[] = options.reduce<string[]>(
            (accumulator, o) => {
                if (!o.group) return accumulator;

                if (accumulator.indexOf(o.group) === -1) {
                    accumulator.push(o.group);
                }

                return accumulator;
            },
            []
        );
        let lcFilter = filter.toLocaleLowerCase();
        let filteredOptions = options.filter((o) => {
            return o.name.toLocaleLowerCase().indexOf(lcFilter) !== -1;
        });
        filteredOptions = orderBy(filteredOptions, ["name"], ["asc"]);

        return (
            <div
                className={`dropdown dropdown-filter ${
                    isRight ? "is-right" : "is-left"
                } ${isActive ? "is-active" : ""}${mega ? " is-static" : ""}`}
            >
                <div className="dropdown-trigger">
                    <button
                        className="button"
                        onKeyDown={this.onKeyDown}
                        onClick={this.activate}
                        disabled={options.length === 0}
                    >
                        {icon && (
                            <span className="icon is-small">
                                {icon !== "alessia" && (
                                    <i
                                        className={`fas fa-xs ${icon}`}
                                        aria-hidden="true"
                                    ></i>
                                )}
                                {icon === "alessia" && (
                                    <Alessia className="si" />
                                )}
                            </span>
                        )}
                        <span>
                            {filter.length > 0 && isActive && filterEnabled ? (
                                <i>{filter}</i>
                            ) : (
                                selected?.name || <i>No options</i>
                            )}
                        </span>
                        <span className="icon is-small">
                            <i
                                className="fas fa-angle-down"
                                aria-hidden="true"
                            ></i>
                        </span>
                    </button>
                </div>
                <div
                    className={`dropdown-menu ${
                        mega ? "dropdown-menu-mega" : ""
                    }`}
                    role="menu"
                    ref={this.menuRef}
                >
                    <div className="dropdown-content">
                        {groupNames.length === 0 &&
                            this.renderGroup(null, options, onChange)}
                        {groupNames.length > 0 && (
                            <div className="is-flex">
                                {" "}
                                {groupNames.map((groupName) =>
                                    this.renderGroup(
                                        groupName,
                                        filteredOptions.filter(
                                            (o) => o.group === groupName
                                        ),
                                        onChange
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    private renderGroup(
        name: string,
        options: DropdownSelectOption[],
        onChange: DropdownSelectProps["onChange"]
    ) {
        return (
            <div className="dropdown-filter-group">
                {name && (
                    <p className="pl-1 dropdown-filter-group-label">{name}</p>
                )}
                <ul className="dropdown-filter-group-list">
                    {options.map((o) => this.renderOption(o, onChange))}
                </ul>
            </div>
        );
    }

    private renderOption(
        option: DropdownSelectOption,
        onChange: DropdownSelectProps["onChange"]
    ): JSX.Element {
        return (
            <DropdownSelectOptionEntry
                className="pl-1 is-cursor-pointer"
                option={option}
                onSelected={this.handleValueChange}
            />
        );
    }

    private handleValueChange = (option: DropdownSelectOption) => {
        if (this.props.filterEnabled) {
            this.setState({
                ...this.state,
                filter: "",
            });
        }

        if (this.props.value && option.value === this.props.value) {
            return;
        }
        this.props.onChange(option.value);
    };

    private activate = () => {
        this.setState({
            ...this.state,
            isActive: true,
            filter: "",
        });
        window.addEventListener("mousedown", this.windowClickListener);
    };

    private windowClickListener = (e: MouseEvent) => {
        if (this.menuRef && !this.menuRef.current.contains(e.target as Node)) {
            this.setState({
                ...this.state,
                isActive: false,
                filter: "",
            });
            window.removeEventListener("mousedown", this.windowClickListener);
        }
    };

    private onKeyDown = (e: React.KeyboardEvent) => {
        if (!this.props.filterEnabled) return;

        if (e.key.length === 1) {
            this.setState({
                ...this.state,
                filter: this.state.filter ? this.state.filter + e.key : e.key,
            });
            return;
        }

        if (e.key === "Escape") {
            this.setState({
                ...this.state,
                filter: "",
            });
            return;
        }

        if (e.key === "Backspace" && this.state.filter.length > 1) {
            this.setState({
                ...this.state,
                filter: this.state.filter.slice(0, -1),
            });
            return;
        }
    };
}

interface DropdownSelectOptionEntryProps
    extends React.HTMLProps<HTMLLIElement> {
    option: DropdownSelectOption;
    onSelected: (option: DropdownSelectOption) => void;
}

const DropdownSelectOptionEntry: React.FunctionComponent<DropdownSelectOptionEntryProps> = (
    props
) => {
    let { option, onSelected, ...rest } = props;

    let handleClick = () => {
        onSelected(option);
    };

    return (
        <li onClick={handleClick} {...rest}>
            {option.name}
        </li>
    );
};
