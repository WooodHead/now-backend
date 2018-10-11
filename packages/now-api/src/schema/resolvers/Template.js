import {
  fieldOrder,
  exhibitFields,
  neighborhoodFields,
  movieFields,
  tvFields,
  amaFields,
  onlyOneFields,
  discussFields,
  debateFields,
  gamesFields,
  sportsFields,
  skillsFields,
  hobbyFields,
  karaokeFields,
} from './Fields';

export const tempTemplates = {
  'ebf997e5-cf24-407f-b98d-5108d73b4044': {
    id: 'ebf997e5-cf24-407f-b98d-5108d73b4044',
    title: `Visit A Museum Exhibit`,
    header: {
      id: 'activity/5a73550eb1780c0f767ad4b9862e32fa.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAIEAQMFBgf/xAAsEAACAQMCAwUJAAAAAAAAAAABAgADBBEhMQUSQQYTMlGxFCMkM1NhgZKh/8QAGgEAAgMBAQAAAAAAAAAAAAAAAAECAwQFBv/EAB0RAQEAAgMAAwAAAAAAAAAAAAEAAhEDBDESIbH/2gAMAwEAAhEDEQA/APr0EgDJOImusCVBHSefDbW0y6hSxYADc52kPaaH1k/aVqvyz+PWV+L8Yp8CtBcXIZwzhFRWGT5nXfAm3i6pmKstu9F0Rc0ScCqpJ6A5k1dW2MqVvePSqhso3h16YJzMyHNwHG6GB3W4kUPMgJkplpSIiKKpcgKGxtp6zzXbJa1SrbfDrXRiQVK5wMz1ZoB894cg9JwO01JkNuLfKkpWYnxeGmWG/wBwJ0+n2MMH4pv88kfTtujaErYWlM6gDQjbGDgSyo5iB5zTZWqtZ21VeYN3SnlLHciWURg40IxKeblxzdkvVbeBgYHSIiYqUiIhFhlDDBlW54Zb3bK1UOSiuow2NGGD/IiSMk8ZW2la06NJKac3KihRk50AxN2IiJV9iRERTv/Z',
      blocked: false,
    },
    description: `Check out that local art, fashion, history, etc. exhibit you've been meaning to see forever.`,
    ...exhibitFields,
    fieldOrder,
  },
  'f2a7b3a5-b00f-4b23-a224-2db4049fec27': {
    id: 'f2a7b3a5-b00f-4b23-a224-2db4049fec27',
    title: `Explore A Neighborhood`,
    imageName: 'explore-a-neighborhood',
    header: {
      id: 'activity/187020eea400e96a2398060cd86b99cb.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAEEAgMFBgf/xAApEAABBAECAwgDAAAAAAAAAAABAAIDBBEhMRITYQUGFCJCUXGhQYGx/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECBAP/xAAhEQEBAAEDAwUAAAAAAAAAAAAAARECAyEEMVFhgcHh8P/aAAwDAQACEQMRAD8A+pIihdblSijOmURUooWQGhzkY6KW4EIiKoKnaiksyGB07I43NPBGHYdK7GxPt0G6uLn3qM9qwJG+H4WRubGXh3ExxGM6fxWWzs1MZ5VuQ6hFXjfYhZI84fWa7LAfdn5Hxt8K1YtEGKDxEdbj0Mjt8Y9OdM9T9rn1e788EVfmPrSzQNDRL5xkDOMj9/Szn7EsW44225YZyxwPES5uRppoOi1dfv6/vlLm0s9iHlWSbLar35bBKyQl0gI9ed3dd15SpB3gq3YZ+VafynhxaZM5AOoxleri7EsttzzyvryNknEzGZeAzAIA67/S1Hu29tlliN8IeHh54nOIOu2y99vqdW3mXnPmfbdsd2GaOxE2WJ3Ex4y0rYq9Kt4SnHBp5BjQkjfqrC5XnM45EREBERAREQEREH//2Q==',
      blocked: false,
    },
    description: `Try new restaurants and shops, or go on scenic walks through neighborhoods you want to know better.`,
    ...neighborhoodFields,
    fieldOrder,
  },
  'ef7ec7d3-6a3b-4c63-8450-ac5c1c3ce819': {
    id: 'ef7ec7d3-6a3b-4c63-8450-ac5c1c3ce819',
    title: `See A Movie In Theaters`,
    imageName: 'see-a-movie-in-theaters',
    header: {
      id: 'activity/821f547da9eb85a7077b721c96c1aae6.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGgABAAIDAQAAAAAAAAAAAAAAAAIDAQQFB//EACwQAAIBAwIFAgUFAAAAAAAAAAECAwAEEQUxEhQhQVETYQYiMqHBJDVxgYL/xAAZAQACAwEAAAAAAAAAAAAAAAAAAwECBQT/xAAjEQABAwQCAQUAAAAAAAAAAAABAAIRAxIhMQQTYUFxgaHB/9oADAMBAAIRAxEAPwD0qlKE43rJWIlKyqlvzVPO2XO8lzSczt6ffOM4prKNSoJaExtJ7hIU5JEiQvI6oo3LHArKsrqGUgg9QQd6rurYyhAH4GRg6twhhn3B3rNtALeBYgS3D3PTNVLQBnaUQ4OghWUpSqKUqqWUIwUHLkEhfYbmra598RFqVlNno3qwn/UZx91FNpUe5/XMTOfiU6hb2C4SFXrF0jaLIhuhbNIAQ4BbiUnHTHXHvWqbKAWxl4F9IWP7qGOSdvp/jp5qenJBemOOdFeKPTIISD5b5j+KnJoccepc0br9AIijW2CRw4xwgDt385re49nFBoOfkZ1vAjXr748LQJbOBCzp+pW9j8O281xcvNGGKCQRt/QIPWtyx1a11MvyrMwj3JQrjNcO+1nTZLRbOKxlNtayI4Rl4VkUHqPI371v6BLa3T3t1Z2vLQSSgLF4woz96XzOK3pfWc0h0+I2Pw/S5awESuxSlKwFxpUWjR8cSq2DkZGcUpU6QiRRp9CKu2wxttUqUoJkyUSoTQx3ETRTIsiNurDINRt7WC1QpbxJEpOSEGBmlKm51ts4RKtpSlVQv//Z',
      blocked: false,
    },
    description: `See a film you're excited about and talk through your reactions together.`,
    ...movieFields,
    fieldOrder,
  },
  'ff18f172-74c3-4bcc-9c3e-45966c721869': {
    id: 'ff18f172-74c3-4bcc-9c3e-45966c721869',
    title: `Watch A TV Show`,
    imageName: 'watch-a-tv-show',
    header: {
      id: 'activity/8f1dc43e60f8a3270c2e76985293827c.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUCBAYBA//EAC4QAAIBAwIEBQEJAAAAAAAAAAECAwAEEQUhBhIxQRMUIjJRkRY2YXGCkqGy4f/EABoBAAIDAQEAAAAAAAAAAAAAAAIDAAQFAQb/xAAhEQACAgEEAgMAAAAAAAAAAAABAgADMREhQVEEEhOBsf/aAAwDAQACEQMRAD8A31BorjMF6158TcgTgZNR8T8KiWyOUDAqrZrqd/aC8gis0hZmC+LMwOFYrvhcdqsVUM+BFPYqZMvBwa7S67kvNO8s155Hw7iZYl8OcljnuAQMgd6uo/Y1yyhkzOpYr4npRRRVeMhVK91KxtCVuLyGNwPYzjm+lXaS8Vxp9nrp+Reb0erAz7h3ptIBsAPMCwkKSJ46bxJYXFok1zdxwyFjmOQ4ZQDt0+tS0/irQ4dDGnXdxOsitJzGOFmG7sRgjrsao8PXKWeiWge3EhuLhkB5c43H+1p/Lx52Vf2itI3LRYSBz+fUqfGblGpmV4y1Gw1TR7SLTeW5lt5RKGOcj5Xf5zvv2prBxFpksMbyXccTOoLIxPoPcH8qzOr8M8RTOUnulu0lkJiCNjHU4wcYGB89qcz6ZLp3Ai2bIDNGimQJvvzZNP8AJamxa+znfs5xBrDoW22mkhmiuIllhkWSNujKcg1OlPC33dtf1/2NNqxLF9HK9GXkPsoMKhPBFcxNFPGskbdVYZBoooQdIUIYYreJYoY1jjUYVVGAKnRRU11ki2+0y7u7tJo9TlgRCGWMRggEDr/PemKghAGbmIGCcYzRRRNYzAA8QQoB1E5FFHCgjiRUQZIVRgb7mpUUUMKf/9k=',
      blocked: false,
    },
    description: `Watch and discuss a TV show you enjoy or just have ALL the feelings about.`,
    ...tvFields,
    fieldOrder,
  },
  '8f0f400f-0cd5-43dd-b357-3cc3f07be2bf': {
    id: '8f0f400f-0cd5-43dd-b357-3cc3f07be2bf',
    title: `Ask Me Anything`,
    imageName: 'ask-me-anything',
    header: {
      id: 'activity/9973d7a38ca7e1f366001ce6b1a0dc3b.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAAIBAwUEBgf/xAArEAABBAEEAQIEBwAAAAAAAAACAAEDEQQFEiExQSJxBhMUkRUyUWFigaH/xAAZAQADAQEBAAAAAAAAAAAAAAAAAQQCAwX/xAAdEQACAgMBAQEAAAAAAAAAAAAAAQIRAxIhQTFR/9oADAMBAAIRAxEAPwD6khCrke3YX6ViJR7vpSqWC3fa3DNd3STezhvv0Ve6+K90Km6THT+lxyDG1k9N0gJQk/K9rhEwysZ5sSUZQkZ3EgLcJezspxWaTHjMSJ2rxxz/AEl7RvVa2aCEoWwNaZBzBUyt6r5VyxdejmGXHzMaecTgMWMBtwcXfm2/z7LpjjtKroDn10pyE4GlIIJY9hML073d8p8uOXC0OHF04I2ChjLc7UwPw9N5d74ZXan9OeHHPORQRt6y3tyDfvXu33T42KTATbREWLkf5KdpxlJ2ejLJCWHHGuoy9Ekn0rRs2OfG2x4shkIxszOQvz1fD8rq+FSaXBOSETCOQ7pyun8t0s7U9Jl1P4k/Dvnyw4pQ/MlcCrcT3XHngWXoNLxg0zTI8aITkaM3B/L99raa5+k02+vxmihCEycFHm/LIQgBSijNqMBJqqna2r2U7W/TzaEIHbIGGMZSlYGYy7Ly6ZmZrpu+0IQFtkoQhAj/2Q==',
      blocked: false,
    },
    description: `Open up about an experience or aspect of your identity that allows people to better understand the community around them.`,
    ...amaFields,
    fieldOrder,
  },
  '0b721d9e-ead6-4a35-9b98-82b780ebd32a': {
    id: '0b721d9e-ead6-4a35-9b98-82b780ebd32a',
    title: `Am I The Only One`,
    imageName: 'am-i-the-only-one',
    header: {
      id: 'activity/70d28d6070d6781d51f733b935775fef.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAQFAQIDBwb/xAAtEAABBAECBQIEBwAAAAAAAAABAAIDEQQFMQYSISJBE1EWYXGBMkJyk6HR4f/EABoBAAIDAQEAAAAAAAAAAAAAAAMEAAEFAgb/xAAeEQEAAgIDAAMAAAAAAAAAAAABAAIDEQQSMRMhkf/aAAwDAQACEQMRAD8A+mTZFq42aKRDc9YzawfK5SZUEUgjkmYx7tml1FYmY98T2RDvc0htGup2UDI4PmbiB8WSJcj87XdGn6H+0QxjF8uZp9BLQuAQOBVPoLp348hkc5zA4NZzG6rdWtH2UaBCUyNgZ0RYb+ELKEwsLRw7lusPrlJrYWrq6ZT5OUmRFixmaWRsbG9S5xoBXEkjm4ByC036ReRt4teW6WzL4l4lx4p5HPaZPUcCejGNNmh49vuvpeMeKp4ZcvTMRjWtj5WSSHclwsgfKqCfx4d2D9mJfmF6ttaDyTMDIwnxCLDmYQ3dgPcPqN1MFnyaXlbp5XTCbnIkFU5vQ/wvQ9A1B2p6TFNIbkb2SfqHn77oefGVVr5GOHzPmeiaZaIiJOakIiKSSFo+k4uh5E0+I1xkmHKTIeahd0FGzOGsDPysjIndMX5D+d9PoX8uiIiGW47GLvGwprqakb4L0r3yP3P8Vlpek42kRSR4xkLZHcxD3X12RFTeyaWXTj4qPatQZNREXEPP/9k=',
      blocked: false,
    },
    description: `Discuss the things you do or experience that make you feel alone. You might find that more people relate to you than you think.`,
    ...onlyOneFields,
    fieldOrder,
  },
  'c26283a6-8aac-46ba-862c-889c42817dfa': {
    id: 'c26283a6-8aac-46ba-862c-889c42817dfa',
    title: `Let's Discuss`,
    imageName: 'lets-discuss',
    header: {
      id: 'activity/808883957fed23a1fbad6a57553f27ad.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGQABAAMBAQAAAAAAAAAAAAAAAAIFBgcB/8QAKRAAAgIBAgUDBAMAAAAAAAAAAQIAAwQFEQYSITFBEyJhFFGBkSQywf/EABkBAAIDAQAAAAAAAAAAAAAAAAACAQMEBf/EAB4RAAICAgIDAAAAAAAAAAAAAAABAhESIQMxMpHw/9oADAMBAAIRAxEAPwDrERIW/wBD1mg5BPeJUJqK2ak2IlFxKbhrOXZQZLUtRo0vDfMyXda1IB5VLEk9tgIySfTLHxyTSa7LWJXYOoVajhVZeNaXptG6ttt+J5ZltULQDsy7bfO57SVBvoTFp0yyiRQ7qCZKIQJQcV6y+kac9tJU3khEB68pO/Xb8GX8oOLdGyNZ01acdlDLYH93nYEf7GhV7HhWWzMcGaxkNqz0ZmTY65KnkNjEg2A79PkgzbZK1vjWLaqunKSynsfMxmLw79LhWJbSzur7+uAQ1TDtynxNAKLNR07+VgDMyAvps7ryK/zGck3o1Tgryv72ZHgniG+rVxgX2FsfLY8gJ6Vv1I2+wPb9ToCad6uQ19r+wsjKo+679/3Oevwll4eqUW4ZJsruRhQQQRsQehPedRrUquxPk9o85Y+JVz1dpkoiJQZxERABERABERABERAD/9k=',
      blocked: false,
    },
    description: `Unpack current news, interests, or life experiences, with others who will bring unique perspectives to the table.`,
    ...discussFields,
    fieldOrder,
  },
  'b5096d9f-7bba-4259-9bd2-2b2497e361b4': {
    id: 'b5096d9f-7bba-4259-9bd2-2b2497e361b4',
    title: `Let's Debate`,
    imageName: 'lets-debate',
    header: {
      id: 'activity/1462509800f4d264c71fff11d22612f7.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAAAAECAwUGBAf/xAAsEAACAQMCBAQGAwAAAAAAAAABAgMABBEFEgYTITEUQVFxIiNCYYGRcqHw/8QAGgEAAwADAQAAAAAAAAAAAAAAAAECAwQFBv/EACARAAMAAQQCAwAAAAAAAAAAAAABAjEDBBEhEnETQVH/2gAMAwEAAhEDEQA/APXqQsFGScUtRSMN+D2FefS5ZlHh1PZhS7h6j91Ualq0enTwRtA8iy5ZmG0CNRjJJPvVFovFEDajPayyzyRTSSSxzTsPgUDO3HkMDpW1G1u5dSsA+smyaVR559qFlDHHWsvwzr1zqpvIrgCSSL5kexAoKH6fcHpV3YztfWqz8iSHJIKSAAgg4/xpau3rSpza4aDPZYUU2MFUAPenVrDCoZRhs4zmpqjMnzuUY3IK7t2Ph9s+tOciMrxdeeGl0/EjRq0h5mMkFcjOehrO6dCDxxPayoyJA0zoynG7aNwH26MK39zLai4eJpog4CDYXGQWbA6feqWXToYOKjcyyRoZnlYRFhvKtEqZx5jKE9K7Glu6Wj8cr6fvKYVOOzKcNXbahouu3DsLeRFRgUyAEJztH5GM/etlwavO0qS4MrOsk7EB23EYwO/91wnQ7Cx0K4t7O1EPi5LWGQAEFjlc9/5GrvQI47GwniCcuJLyZUwPLecdv1+KNxvKvQqP1r3hE+PFFvRRRXFLCjFFFAEPg7bmGTw8W8sGLbBkkdjn1qKXToptQhvi8okhUqoVsLg98iiirm6l8piOiSCKVkaSNXMZyhYZ2n1FLHEkSlY0CgkkgDzPUmiip5GOooopAf/Z',
      blocked: false,
    },
    description: `Talk through the news or societal issues and learn from other people's viewpoints and experiences.`,
    ...debateFields,
    fieldOrder,
  },
  '6deb37cb-9f39-4ede-936a-20339a1b258c': {
    id: '6deb37cb-9f39-4ede-936a-20339a1b258c',
    title: `Play Board Games`,
    imageName: 'play-board-games',
    header: {
      id: 'activity/04f25dff9513e34fba9ccd315957cc09.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGQABAAMBAQAAAAAAAAAAAAAAAAEDBQQH/8QAKBAAAgIBAwIGAgMAAAAAAAAAAQIAAwQFERIhMQYTQVFhkUKxUoHh/8QAGQEAAgMBAAAAAAAAAAAAAAAAAQIAAwUE/8QAHREAAgMAAwEBAAAAAAAAAAAAAAECAxESEzEhQf/aAAwDAQACEQMRAD8A9KiJz5uXRh45uyLVqrBA5N+plxi5NJGJ6dG8TipurvrF1Dh0YbqynoZctrhtu4+Y7raDhfEydW1/H0kILlZns7Kg67e/XpLNO1OjUqDkYzsVB4kMNiD8wdcs0d1TUebXw0ogdolZWJieKdOyM/T6zjDm9NnI1+rDYg7fPWbcrtBO3tLqLJVWRnH1Bi8emN4exMjD03hkqUdnL8Ceqg+/1vNNiQCQpYgdh6x6mT+X9TossdljnL9HTTlsjM13Ap1DTWNzilq1LI1jbKjHbv8AqU+EVxFwHqoyK7rFflbwJ7nt3A6bCZPjTUbi66d5DpUCLPMPaz4HwJkeGs1sLXscq+y2t5TjfuD/ALtLulyqbO+XKVHBvw9PiQpJUEjYyZmGYIiICEcR7D6jgv8AEfURDrIU5GDiZQUZGNVcF6rzQHaRVp2FQwarDorI7FawCIiHk/NDrOiIiKA//9k=',
      blocked: false,
    },
    description: `Get people together for a fun board game hangout, whether it's for one game or many.`,
    ...gamesFields,
    fieldOrder,
  },
  '54d49999-4731-48ee-88a1-db8fe803f048': {
    id: '54d49999-4731-48ee-88a1-db8fe803f048',
    title: `Play Pickup Sports`,
    imageName: 'play-pickup-sports',
    header: {
      id: 'activity/9255858798c25927eaa998a3c028fba9.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGgABAAIDAQAAAAAAAAAAAAAAAAEEAgMFBv/EACoQAAICAAUDAgYDAAAAAAAAAAECAAMEERIhMRMiUQVBBhQyQmGBcZGx/8QAGQEAAgMBAAAAAAAAAAAAAAAAAgQAAQMF/8QAHREAAwADAAMBAAAAAAAAAAAAAAECAxESBDHwE//aAAwDAQACEQMRAD8A99BIHJiWPT60txbdRQwVcwD5nCxR+lcnZu+JdFfu5CMw8gbSAwbieh/ic/1WqsYfq6QHBHd+I7fhpTtMVjyuq00c+JWw+KS4akYPWRmrqcww8gyyDnEKlyOiIiCQSNdlTdStyp98pMQppy9oppNaZPzGKtS6w4q1SoBAUgAb5eJXxuLxNuHcvcdKIT+wJZqNZTEVg9wVSwHtmdv8mp6UdGRlzVgQR+DHKzNc9b+YvOOdvS+0cb4fvrv9OBD6nQkMD9uZzG066NkdzsZpTBtVh9NXSS1BpQhe0qOAf1NpVhyP6k8jLGbLVStJv0aRLmUmbokJ9IzkxJmoiIlEMaq1ptvsUEteFDZnbbjKZHjnKIh1dVrp+gVKXox0H3YzKIgt7CEREoh//9k=',
      blocked: false,
    },
    description: `Put together a pickup game for a sport you're excited to play with others.`,
    ...sportsFields,
    fieldOrder,
  },
  'f6676ffa-f182-4067-9138-35223a6bf4e8': {
    id: 'f6676ffa-f182-4067-9138-35223a6bf4e8',
    title: `Learn A Skill`,
    imageName: 'learn-a-skill',
    header: {
      id: 'activity/708c00c8c7b243df650e50d5d1169793.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAQFAQIDBgf/xAAsEAABAwMCBAQHAQAAAAAAAAABAAIDBBESBSEGMUFRExQyoWFxgYKRscHR/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAEDAgT/xAAdEQADAAICAwAAAAAAAAAAAAAAAQIDEQQSITFB/9oADAMBAAIRAxEAPwD6ksXWVq92Iuuw5QXANJ5rn4x7BRdRqzTUMsjcWkCzfmVw4W1MPnNNPJJJK70ksJA67np9Viskw+rOiOPV43kXpFmyZryRyINl0VlYW5BVEbzlieSIrtslU6OqIi0YC1e3MWWyr9Yp66powzT5mxTB4Jc42GO4I900Mh8TBsWhVMshLRCBJcdwQoHA+smaGtbGWuMbmkutbmOXsrbiUNPC2ph4uPKSXH2/6qngyiFPRamCwGTzWBx+EbbftTqU77MvOVrG4+bPTRapUlxzwIG3pt0B/q1iGdnj0ncHuolVTVLoXMp2tc57t8thiRY9/wAKVR05pocHSF7ibkk7DpYdhsqSlM+CVvZIRESMBYREAR9QpBX6dU0ZdiKiJ0Zda9ri11x0nTTpkM0ZlEnizGW+NjuAP4iIHsnIiIEFlEQB/9k=',
      blocked: false,
    },
    description: `Share your expertise on a specific topic with the community around you.`,
    ...skillsFields,
    fieldOrder,
  },
  '46b8e494-bdc9-4b71-8e11-4cb325e01df9': {
    id: '46b8e494-bdc9-4b71-8e11-4cb325e01df9',
    title: `Learn About A Ritual/Hobby`,
    imageName: 'learn-about-a-ritual-hobby',
    header: {
      id: 'activity/5f53eaebf8eb071604dab10d8b14ec68.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAECAwQFBgf/xAAoEAACAgEDAwMEAwAAAAAAAAABAgADEQQSIQUTMUFRcRQiMoFhkaH/xAAZAQACAwEAAAAAAAAAAAAAAAAAAwECBAX/xAAeEQACAgICAwAAAAAAAAAAAAAAAQIRAxIEMSFhof/aAAwDAQACEQMRAD8A+sREhvHnE0HIIexUGWOBIW1XYhTnacHia1q29lwzoyEHhx6fMxaO623RrjCbs5f1J9xK+boesa02s6MTX7jBQoI4gWMDknP7jNWJo2IkI25QfeTKkCVs5Qy0EZEAOX1Sxk0TDP5EDzLU6vSITphYm+mlXdfGBI6tSPonbcMIQ2PX2nn+h7NRQeqX2FTq8gK5yNoP2/4IrJJptr0dTjYY5ccU+k3fw9LVcbF3tSE5wBuzn+ZmBBOO2P7nB6FpOoabqmopayqzQuO6rFMOrHjaMceAJ6Ko1kHtsG9yDmOhJOKMfIhpkaqi4GBgSYiQZxERACllQswGzj1Hv8zVt6To72pL0qew++sDgA4I8D5iIFlKUemWr6dVVqBdXZap9UDnaf1M9VFdO7trt3tubk8mIgEpyl2zJERAqf/Z',
      blocked: false,
    },
    description: `Share your favorite hobby or ritual with people who might be interested in trying something new.`,
    ...hobbyFields,
    fieldOrder,
  },
  'd95e9bc7-dd14-48de-a800-e7fc1fe28228': {
    id: 'd95e9bc7-dd14-48de-a800-e7fc1fe28228',
    title: `Sing Karaoke`,
    imageName: 'sing-karaoke',
    header: {
      id: 'activity/4ac9de7afc31cbe9eb0c0a15164dc2af.jpg',
      baseUrl: 'https://now.meetup.com/images',
      preview:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoADwDASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAEDBAUCBv/EACkQAAEEAQIEBgMBAAAAAAAAAAEAAgMRBBIhBRMxUQYVIkFhcRQygcH/xAAZAQADAQEBAAAAAAAAAAAAAAABBAUAAgb/xAAhEQACAgIBBAMAAAAAAAAAAAAAAQIRAwQSBSExQROBwf/aAAwDAQACEQMRAD8A+mRFXNNHCNUt6fhIpWesbpFmoAXYoLB53hGyHSED35Z3+u6vmex0MvLJ2YbsEEWLXYj8O8FDIg7CsuYCTzHdvtP62vhmm8rf1X6TdvbnirhXc5UGVDkwiWJ1tO24oj+KwOBUT4sOHmZGPjs0xMk9LbJqwCvNHsl8uOMZtRfYbw5JTxqT9liKG/qFKXYwFizMWTKnY0OLIwOoO9/C2p9dQinTOZK1RlD2S4rHGUHJDHCf0m3VsLv3C9M8a5PLYw4MDtLQL1key05ZfJHoDi4MZpaCeuy+X8v4gDX4Tj8h7Vf6fPWly+avVEDb18kYxUU35O9FnP4g6XKexrHSyElrTsNgP8VrTqcQHbjqsvC8eWHD0zx6H6iasHZamsc2R7wB6qA+lN2XjeafDx6KuupRxQTLEREiOBRpbZNblEWugUmAwDv/AEqQAERG2akgiIgEIiLGP//Z',
      blocked: false,
    },
    description: `Take the stage with others who are ready to sing their hearts out.`,
    ...karaokeFields,
    fieldOrder,
  },
};

const getTemplate = (root, { id }) => tempTemplates[id];

export const queries = { template: getTemplate };
