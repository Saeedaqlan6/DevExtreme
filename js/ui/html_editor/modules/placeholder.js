import { getQuill } from "../quill_importer";

import PopoverModule from "./popover";
import Placeholder from "../formats/placeholder";

import { extend } from "../../../core/utils/extend";

getQuill()
    .register({ "formats/placeholder": Placeholder }, true);

class PlaceholderModule extends PopoverModule {
    _getDefaultOptions() {
        let baseConfig = super._getDefaultOptions();

        return extend(baseConfig, {
            escapedChar: "",

            startEscapedChar: undefined,
            endEscapedChar: undefined
        });
    }

    constructor(quill, options) {
        super(quill, options);

        const toolbar = quill.getModule('toolbar');
        if(toolbar) {
            toolbar.addClickHandler('placeholder', this.showPopover.bind(this));
        }

        quill.keyboard.addBinding({
            key: 'P',
            altKey: true
        }, this.showPopover.bind(this));
    }

    showPopover(event) {
        const selection = this.quill.getSelection();
        const position = selection ? selection.index : this.quill.getLength();

        this.savePosition(position);

        this._resetPopoverPosition(event, position);
        super.showPopover();
    }

    _resetPopoverPosition(event, position) {
        if(event && event.element) {
            this._popover.option("position", {
                of: event.element,
                offset: {
                    h: 0,
                    v: 0
                },
                my: "top center",
                at: "bottom center",
                collision: "fit"
            });
        } else {
            const mentionBounds = this.quill.getBounds(position);
            const rootRect = this.quill.root.getBoundingClientRect();

            this._popover.option("position", {
                of: this.quill.root,
                offset: {
                    h: mentionBounds.left,
                    v: mentionBounds.bottom - rootRect.height
                },
                my: "top center",
                at: "bottom left",
                collision: "fit flip"
            });
        }
    }


    insertEmbedContent(selectionChangedEvent) {
        const caretPosition = this.getPosition();
        const selectedItem = selectionChangedEvent.component.option("selectedItem");
        const placeholderData = extend({}, {
            value: selectedItem,
            escapedChar: this.options.escapedChar,
            startEscapedChar: this.options.startEscapedChar,
            endEscapedChar: this.options.endEscapedChar
        });

        setTimeout(function() {
            this.quill.insertEmbed(caretPosition, "placeholder", placeholderData);
            this.quill.setSelection(caretPosition + 1);
        }.bind(this));
    }
}

module.exports = PlaceholderModule;
