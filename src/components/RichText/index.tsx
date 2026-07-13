import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { Lock } from 'lucide-react'

import { cn } from '@/utilities/ui'
import { internalDocToHref, resolveMemberHref } from './memberLinks'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const linkConverters = LinkJSXConverter({ internalDocToHref })

// Member-gated links inside body prose: the /members portal, and Luma event RSVP
// links (members-only). Both render a placeholder for anonymous visitors and the
// real link for members, toggled by Outseta's data-o-anonymous / data-o-authenticated
// body attributes (the same mechanism the nav uses). The placeholder is a <span>,
// not an a[href^="/members"], so Outseta's own global hide rule can't touch it.
//   /members: Outseta injects `a[href^="/members" i]{display:none!important}`, so a
//     raw member link silently vanishes for anonymous readers, leaving a broken
//     sentence; the real <a> is un-hidden for members by globals.css G10.
//   Luma: not Outseta-hidden — the data-o-authenticated wrapper alone gates it.
// resolveMemberHref gates BOTH custom URLs and internal doc links to a /members
// page (the 5th-annual post links the Member Portal as an internal link). (#250)
const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...linkConverters,
  link: (args) => {
    const { node, nodesToJSX } = args
    const memberHref = resolveMemberHref(node)
    if (memberHref) {
      const rel = node.fields.newTab ? 'noopener noreferrer' : undefined
      const target = node.fields.newTab ? '_blank' : undefined
      return (
        <>
          {/* Lock icon marks it as members-only, matching the nav's gated-item
              treatment (NavMenu). Inherits the prose body color (AAA in both
              themes) via currentColor; italic marks it as a note. text-muted-
              foreground would fail AA on the white body. */}
          <span className="italic" data-o-anonymous="true">
            <Lock aria-hidden="true" className="mr-1.5 inline-block size-3.5 align-[-0.15em]" />
            Members-only link. Log in to view.
          </span>
          <span data-o-authenticated="true">
            <a href={memberHref} rel={rel} target={target}>
              {nodesToJSX({ nodes: node.children })}
            </a>
          </span>
        </>
      )
    }
    const stockLink = linkConverters.link
    return typeof stockLink === 'function' ? stockLink(args) : stockLink
  },
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
