import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
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
import { cn } from '@/utilities/ui'
import { collectionHref } from '@/utilities/collectionHref'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return collectionHref(relationTo as 'pages' | 'posts', String(slug))
}

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
// (#250)
const isMemberHref = (href: string) => {
  if (/^\/members(\/|$|\?|#)/i.test(href)) return true
  try {
    // ponytail: matches full URLs (https://luma.com/…); a bare "luma.com/…" with no
    // scheme won't match, but authored links carry one. Base handles relative hrefs.
    return /(^|\.)(luma\.com|lu\.ma)$/i.test(new URL(href, 'http://_').hostname)
  } catch {
    return false
  }
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...linkConverters,
  // Internal links resolve to pages/posts, never /members, so only custom URLs
  // can be member links — checking node.fields.url avoids internalDocToHref throws.
  link: (args) => {
    const { node, nodesToJSX } = args
    if (node.fields.linkType !== 'internal' && isMemberHref(node.fields.url ?? '')) {
      const rel = node.fields.newTab ? 'noopener noreferrer' : undefined
      const target = node.fields.newTab ? '_blank' : undefined
      return (
        <>
          <span className="italic text-muted-foreground" data-o-anonymous="true">
            Members-only link. Log in to view.
          </span>
          <span data-o-authenticated="true">
            <a href={node.fields.url ?? '#'} rel={rel} target={target}>
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
