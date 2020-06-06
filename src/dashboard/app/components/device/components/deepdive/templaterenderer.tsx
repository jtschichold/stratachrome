import * as React from "react";
import { connect } from "react-redux";

import { State as StoreState } from "../../../../store";

import {
    DeepDiveTemplate,
    DeepDiveTemplateWidget,
    Device,
} from "../../../../../../common/models";
import { MetricListManager } from "../../../../lib/metrichandlers";
import { HistoryChart } from "../../../widgets/history";

import { buildContext, interpolateString, applyForEach } from "./templateutils";

export interface DeepDiveTemplateRendererProps {
    templateId: string;
    template?: DeepDiveTemplate;
    device: Device;
    metricListManager: MetricListManager;
    parameterValues?: { name: string; value: string }[];
}

const InternalDeepDiveTemplateRenderer: React.FunctionComponent<DeepDiveTemplateRendererProps> = (
    props
) => {
    let { template, parameterValues, device, metricListManager } = props;
    let lineStart = true;
    let ctx = buildContext(
        device,
        metricListManager,
        template,
        parameterValues
    );

    const renderWidget = (widget: DeepDiveTemplateWidget, index: number) => {
        if (widget.type !== "history") return null; // ignore unknown widget types

        // XXX ugly
        let gridStartCell = 2;
        if (widget.gridCellSize === 1) {
            if (lineStart) {
                lineStart = false;
            } else {
                gridStartCell = 3;
                lineStart = true;
            }
        } else {
            lineStart = true;
        }

        if (!widget.forEach) {
            let title = interpolateString(widget.title, ctx);
            let metric = interpolateString(widget.metric, ctx);

            return (
                <HistoryChart
                    metricListManager={metricListManager}
                    gridStartCell={gridStartCell}
                    metric={metric}
                    binInterval={widget.binInterval}
                    targetUnit={widget.targetUnit}
                    colorKey={index}
                    gridCellSize={widget.gridCellSize}
                    title={title}
                />
            );
        }

        let entries = applyForEach(widget.forEach, ctx);
        return entries.map((e) => {
            let newCtx = { ...ctx, entry: e };
            let title = interpolateString(widget.title, newCtx);
            let metric = interpolateString(widget.metric, newCtx);

            return (
                <HistoryChart
                    metricListManager={metricListManager}
                    gridStartCell={gridStartCell}
                    metric={metric}
                    binInterval={widget.binInterval}
                    targetUnit={widget.targetUnit}
                    colorKey={index}
                    gridCellSize={widget.gridCellSize}
                    title={title}
                />
            );
        });
    };

    for (let parameter of template.parameters) {
        if (
            !parameterValues.find(
                (pv) => pv.name === parameter.name && pv.value !== null
            )
        ) {
            return (
                <div className="notification is-danger grid-col-start-2 grid-col-end-4">
                    Parameter needed: {parameter.name}
                </div>
            );
        }
    }

    return <>{template.widgets.map(renderWidget)}</>;
};

const MemoizedDeepDiveTemplateRenderer = React.memo(
    InternalDeepDiveTemplateRenderer,
    (prevProps, nextProps) => {
        if (prevProps.metricListManager !== nextProps.metricListManager)
            return false;
        if (prevProps.parameterValues !== nextProps.parameterValues)
            return false;
        if (prevProps.template !== nextProps.template) return false;
        if (prevProps.templateId !== nextProps.templateId) return false;
        if (prevProps.device.serial !== nextProps.device.serial) return false;

        return true;
    }
);

const mapStateToProps = (
    state: StoreState,
    props: DeepDiveTemplateRendererProps
) => {
    if (!props.templateId)
        return {
            template: { widgets: [] },
        };

    let template = state.metadata.templateList.find(
        (t) => t.id === props.templateId
    );
    return {
        template,
    };
};

export const DeepDiveTemplateRenderer = connect(mapStateToProps)(
    MemoizedDeepDiveTemplateRenderer
);
