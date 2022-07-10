<template>
  <with-sidebar class="__page__index">
    <template #sidebar>
      <slice-list v-if="simulatorState.libraries" :library="simulatorState.libraries[0]" />
      <textarea class="mt-2 w-full resize-y text-xs p-1 rounded-sm bg-black-400 text-white-400" style="font-family: monospace;" rows="36" v-model="model"></textarea>
    </template>
    <slice-iframe :src="src" :model="model" />
  </with-sidebar>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { state as simulatorState } from "~/store/simulator";

import WithSidebar from '~/components/layouts/WithSidebar.vue';
import SliceList from "~/components/display/slice/List.vue";
import SliceIframe from "~/components/controls/slice/Iframe.vue";

const src = ref("http://localhost:3000/slice-simulator");
// const src = ref("http://localhost:3000/slice-simulator?debug=true");

const model = ref(JSON.stringify({
    variation: "default",
    name: "Default",
    slice_type: "hero",
    items: [],
    primary: {
      text: [
        {
          type: "paragraph",
          text: "This block has a line\nbreak just before the word \"break\"",
          spans: []
        },
        {
          type: "paragraph",
          text: "Text before with a multi-block span!",
          spans: [
            {
              start: 19,
              end: 36,
              type: "label",
              data: {
                label: "label_1"
              }
            }
          ]
        },
        {
          type: "heading1",
          text: "Heading 1 bold text italic still bold normal",
          spans: [
            {
              start: 0,
              end: 7,
              type: "label",
              data: {
                label: "label_1"
              }
            },
            {
              start: 10,
              end: 37,
              type: "strong"
            },
            {
              start: 20,
              end: 26,
              type: "em"
            }
          ]
        },
        {
          type: "paragraph",
          text: "Paragraph",
          spans: []
        },
        {
          type: "paragraph",
          text: "A paragraph with a nested label",
          spans: [
            {
              start: 19,
              end: 25,
              type: "label",
              data: {
                label: "label_1"
              }
            }
          ]
        },
        {
          type: "o-list-item",
          text: "First ordered list item",
          spans: []
        },
        {
          type: "o-list-item",
          text: "Second ordered list item",
          spans: []
        },
        {
          type: "o-list-item",
          text: "Third ordered list item",
          spans: []
        },
        {
          type: "o-list-item",
          text: "Bold and now italic but not anymore value in the last list item",
          spans: [
            {
              start: 0,
              end: 35,
              type: "strong"
            },
            {
              start: 9,
              end: 19,
              type: "em"
            },
            {
              start: 49,
              end: 53,
              type: "strong"
            }
          ]
        },
        {
          type: "paragraph",
          text: "Paragraph",
          spans: []
        },
        {
          type: "list-item",
          text: "First list item",
          spans: []
        },
        {
          type: "list-item",
          text: "Second list item",
          spans: []
        },
        {
          type: "list-item",
          text: "Third list item",
          spans: []
        },
        {
          type: "paragraph",
          text: "Paragraph",
          spans: []
        },
        {
          type: "paragraph",
          text: "A web link",
          spans: [
            {
              start: 0,
              end: 10,
              type: "hyperlink",
              data: {
                link_type: "Web",
                url: "https://prismic.io",
                target: "_blank"
              }
            }
          ]
        },
        {
          type: "paragraph",
          text: "A document link",
          spans: [
            {
              start: 0,
              end: 15,
              type: "hyperlink",
              data: {
                id: "YCiU1hUAACQAxfaH",
                type: "kitchen_sink",
                tags: [],
                slug: "about-edited-2",
                lang: "en-us",
                uid: "about",
                link_type: "Document",
                isBroken: false
              }
            }
          ]
        },
        {
          type: "paragraph",
          text: "A media link",
          spans: [
            {
              start: 0,
              end: 12,
              type: "hyperlink",
              data: {
                link_type: "Media",
                name: "patrick-robert-doyle-eb8dmXNOGP4-unsplash.jpg",
                kind: "image",
                url: "https://images.prismic.io/gatsby-source-prismic-v4/6234a400-2c25-4165-8b31-b17cfbefa0d2_patrick-robert-doyle-eb8dmXNOGP4-unsplash.jpg?auto=compress,format",
                size: "3994190",
                height: "4061",
                width: "6091"
              }
            }
          ]
        },
        {
          type: "paragraph",
          text: "A non-image media link",
          spans: [
            {
              start: 0,
              end: 22,
              type: "hyperlink",
              data: {
                link_type: "Media",
                name: "sample.pdf",
                kind: "document",
                url: "https://gatsby-source-prismic-v4.cdn.prismic.io/gatsby-source-prismic-v4/f68daae5-1e36-466d-9d8f-e51175eed7b3_sample.pdf",
                size: "3028"
              }
            }
          ]
        },
        {
          type: "paragraph",
          text: "A paragraph with a nested document link",
          spans: [
            {
              start: 19,
              end: 25,
              type: "hyperlink",
              data: {
                id: "YCiU1hUAACQAxfaH",
                type: "kitchen_sink",
                tags: [],
                slug: "about-edited-2",
                lang: "en-us",
                uid: "about",
                link_type: "Document",
                isBroken: false
              }
            }
          ]
        },
        {
          type: "paragraph",
          text: "Paragraph",
          spans: []
        },
        {
          type: "image",
          url: "https://prismic-io.s3.amazonaws.com/gatsby-source-prismic-v4/6234a400-2c25-4165-8b31-b17cfbefa0d2_patrick-robert-doyle-eb8dmXNOGP4-unsplash.jpg",
          alt: "Alt text",
          copyright: "Copyright text",
          dimensions: {
            width: 6091,
            height: 4061
          }
        },
        {
          type: "paragraph",
          text: "Paragraph",
          spans: []
        },
        {
          type: "embed",
          oembed: {
            type: "video",
            embed_url: "https://www.youtube.com/watch?v=nRUZwmSMS8g",
            title: "Hospital Podcast 437 - Bop Takeover",
            provider_name: "YouTube",
            thumbnail_url: "https://i.ytimg.com/vi/nRUZwmSMS8g/hqdefault.jpg",
            height: 113,
            width: 200,
            version: "1.0",
            author_name: "Hospital Records",
            author_url: "https://www.youtube.com/c/hospitalrecords",
            provider_url: "https://www.youtube.com/",
            cache_age: null,
            thumbnail_width: 480,
            thumbnail_height: 360,
            html: "<iframe width=\"200\" height=\"113\" src=\"https://www.youtube.com/embed/nRUZwmSMS8g?feature=oembed\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>"
          }
        }
      ],
      image: {
        dimensions: {
          width: 900,
          height: 500
        },
        alt: "Placeholder image",
        copyright: null,
        url: "https://images.unsplash.com/photo-1560762484-813fc97650a0?w=900&h=500&fit=crop"
      }
    }
  }, null, 2))

defineExpose({ simulatorState, src });
</script>
