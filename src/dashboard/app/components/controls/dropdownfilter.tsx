import * as React from "react";

interface DropdownFilterOption {
    name: string;
    value: any;
    group: string;
}

export interface DropdownFilterProps {
    value: DropdownFilterOption[];
    onChange: (value: DropdownFilterOption[]) => void;
    isRight: boolean;
    options: DropdownFilterOption[];
}

interface State {
    isActive: boolean;
}

export class DropdownFilter extends React.Component<
    DropdownFilterProps,
    State
> {
    private menuRef: React.RefObject<HTMLDivElement> = React.createRef();

    state: State = {
        isActive: false,
    };

    componentWillUnmount() {
        window.removeEventListener("mousedown", this.windowClickListener);
        this.menuRef = null;
    }

    render() {
        let { value, isRight, options, onChange } = this.props;
        let { isActive } = this.state;

        let groups = new Map<string, DropdownFilterProps["options"]>();
        options.forEach((o) => {
            if (!groups.has(o.group)) {
                groups.set(o.group, []);
            }
            groups.get(o.group).push(o);
        });
        let groupNames = [...groups.keys()];

        return (
            <div
                className={`dropdown dropdown-filter ${
                    isRight ? "is-right" : "is-left"
                } ${isActive ? "is-active" : ""}`}
            >
                <div className="dropdown-trigger">
                    <button className="button" onClick={this.activate}>
                        <span className="icon is-small">
                            <i
                                className="fas fa-xs fa-sliders-h"
                                aria-hidden="true"
                            ></i>
                        </span>
                        <span>Filters</span>
                        {value.length !== 0 && (
                            <span className="tag is-link is-rounded ml-2 is-height-auto">
                                {value.length}
                            </span>
                        )}
                        <span className="icon is-small">
                            <i
                                className="fas fa-angle-down"
                                aria-hidden="true"
                            ></i>
                        </span>
                    </button>
                </div>
                <div className="dropdown-menu" role="menu" ref={this.menuRef}>
                    <div className="dropdown-content">
                        <div className="is-flex">
                            {groupNames.map((g) =>
                                this.renderGroup(
                                    g,
                                    groups.get(g),
                                    value,
                                    onChange
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private renderGroup(
        groupName: string,
        options: DropdownFilterOption[],
        value: DropdownFilterOption[],
        onChange: DropdownFilterProps["onChange"]
    ): JSX.Element {
        return (
            <div className="dropdown-filter-group">
                <p className="dropdown-filter-group-label">{groupName}</p>
                <ul className="dropdown-filter-group-list">
                    {options.map((o) => (
                        <li>
                            <label className="checkbox">
                                <DropdownCheckbox
                                    type="checkbox"
                                    className="mr-2 ml-1"
                                    option={o}
                                    defaultChecked={
                                        value.findIndex(
                                            (v) =>
                                                v.group === o.group &&
                                                v.value === o.value
                                        ) !== -1
                                    }
                                    checked={
                                        value.findIndex(
                                            (v) =>
                                                v.group === o.group &&
                                                v.value === o.value
                                        ) !== -1
                                    }
                                    onCheckboxChange={this.handleValueChange}
                                />
                                {o.name}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    private handleValueChange = (
        option: DropdownFilterOption,
        checked: boolean
    ) => {
        if (checked) {
            this.props.onChange([...this.props.value, option]);

            return;
        }

        this.props.onChange([
            ...this.props.value.filter(
                (v) => v.group !== option.group || v.value !== option.value
            ),
        ]);
    };

    private activate = () => {
        this.setState({
            ...this.state,
            isActive: true,
        });
        window.addEventListener("mousedown", this.windowClickListener);
    };

    private windowClickListener = (e: MouseEvent) => {
        if (this.menuRef && !this.menuRef.current.contains(e.target as Node)) {
            this.setState({
                ...this.state,
                isActive: false,
            });
            window.removeEventListener("mousedown", this.windowClickListener);
        }
    };
}

interface DropdownCheckboxProps extends React.HTMLProps<HTMLInputElement> {
    option: DropdownFilterOption;
    onCheckboxChange: (option: DropdownFilterOption, checked: boolean) => void;
}

const DropdownCheckbox: React.FunctionComponent<DropdownCheckboxProps> = (
    props
) => {
    let { option, onCheckboxChange, ...rest } = props;

    let handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckboxChange(option, e.target.checked);
    };

    return <input type="checkbox" onChange={handleValueChange} {...rest} />;
};
