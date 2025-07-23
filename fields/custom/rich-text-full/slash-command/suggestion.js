import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import CommandsList from "./commands-list";
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Table
} from "lucide-react";


// TODO: add keywords to make search more flexible?
export default function suggestion(openMediaDialog) {
  return {
    items: ({ query, editor }) => {
      let suggestionsArray = [
        {
          icon: <Pilcrow className="h-4 w-4"/>,
          title: "Text",
          command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
          disableInTable: true,
        },
        /*{
          icon: <Heading1 className="h-4 w-4"/>,
          title: "Heading 1",
          command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
        },*/
        /*{
          icon: <Heading2 className="h-4 w-4"/>,
          title: "Heading 2",
          command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
        },*/
        {
          icon: <Heading3 className="h-4 w-4"/>,
          title: "Heading 3",
          command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
          disableInTable: true,
        },
        {
          icon: <List className="h-4 w-4"/>,
          title: "Bullet list",
          command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
          disableInTable: true,
        },
        {
          icon: <ListOrdered className="h-4 w-4"/>,
          title: "Numbered list",
          command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
          disableInTable: true,
        },
        {
          icon: <Table className="h-4 w-4"/>,
          title: "Table",
          command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
          disableInTable: true,
        },
        {
          icon: <Quote className="h-4 w-4"/>,
          title: "Quote",
          command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().toggleBlockquote().run(),
          disableInTable: true,
        },
        /*{
          icon: <Code className="h-4 w-4"/>,
          title: "Code",
          command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
        },*/
      ];
      
      if (openMediaDialog) suggestionsArray.splice(6, 0, {
        icon: <Image className="h-4 w-4"/>,
        title: "Image",
        command: ({ editor, range }) => {
          // TODO: fix mouse click event (close dialog immediately)
          editor.chain().focus().deleteRange(range).run();
          openMediaDialog();
        },
      });

      // 3. Update the filtering logic
      return suggestionsArray.filter(item => {
        // Check if the cursor is currently inside a table
        const isInTable = editor.isActive('table');

        // Determine if the item is allowed in the current context
        const isAllowed = !isInTable || !item.disableInTable;

        // Check if the item's title matches the user's query
        const matchesQuery = item.title.toLowerCase().startsWith(query.toLowerCase());

        return isAllowed && matchesQuery;
      }).slice(0, 10);    },

    render: () => {
      let component
      let popup

      return {
        onStart: props => {
          component = new ReactRenderer(CommandsList, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          })
        },

        onUpdate(props) {
          component.updateProps(props)

          if (!props.clientRect) {
            return
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          })
        },

        onKeyDown(props) {
          if (props.event.key === "Escape") {
            popup[0].hide()

            return true
          }

          return component.ref?.onKeyDown(props.event)
        },

        // TODO: potential memory leak here, review this
        onExit() {
          popup[0].destroy()
          component.destroy()
        },
      }
    },
  };
}
