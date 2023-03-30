import {json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {image} from '~/image.server'

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export async function loader() {
  const post = {
    title: 'Angular - tips and tricks for a better code',
    image: {
      description: 'A web developer working on a laptop with a coffee cup',
    },
    content:
      'This article aims to show some tricks that can be used in Angular to make the code cleaner and improve the performance of your application.',
  }
  const id = slugify(post.image.description)

  if (await image.exists(id)) {
    return json({
      ...post,
      image: image.toUrl(id),
    })
  }

  try {
    return json({
      ...post,
      image: await image.generate(id, post.image.description),
    })
  } catch (error) {
    console.error(error)
  }

  return json({
    ...post,
  })
}

export default function Index() {
  const data = useLoaderData()

  return (
    <main>
      <article className="article">
        {data.image ? (
          <img
            className="article__image"
            src={data.image}
            alt=""
            width="128px"
            height="128px"
          />
        ) : null}

        <div>
          <h1>{data.title}</h1>
          <p>{data.content}</p>
        </div>
      </article>
    </main>
  )
}
