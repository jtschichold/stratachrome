export interface DeepDiveTemplateParameter {
    name: string;
    type:
        | "LogicalInterface"
        | "HardwareInterface"
        | "Counter"
        | "Vsys"
        | "Zone";
}

export interface DeepDiveTemplateValue {
    name: string;
    value: string;
}

export interface DeepDiveTemplateWidget {
    forEach?: string;
    type: "history";
    title: string;
    description?: string;
    gridCellSize: number;
    metric: string;
    targetUnit?: string;
    binInterval?: number;
}

export interface DeepDiveTemplate {
    id: string;
    version: number;
    name: string;
    description?: string;
    subtitle?: string;
    category: string;
    parameters: DeepDiveTemplateParameter[];
    widgets: DeepDiveTemplateWidget[];
}

export interface DeepDiveTemplateParameterInstance {
    name: string;
    value: string;
}

export interface DeepDiveInstance {
    id: string;
    name: string;
    deviceSerial: string;
    templateId: string;
    parameters: DeepDiveTemplateParameterInstance[];
}
