const NOW_BOT_USER_ID = 'ec6c81d8-7bb4-11e8-ba5d-2bc28925de05';

exports.up = knex =>
  knex('users').insert({
    id: NOW_BOT_USER_ID,
    auth0Id: 'INVALID_NOW_BOT_USER',
    firstName: 'Meetup',
    lastName: 'Now',
    photoPreview:
      'data:image/jpg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAGgAAAwADAQAAAAAAAAAAAAAAAAUHAwYIAv/EADAQAAEDAwEFBwQCAwAAAAAAAAECAwQABREGEiExQVEHEyJCUnGRMmFygbHBFIKh/8QAGQEAAgMBAAAAAAAAAAAAAAAAAwYCBAUH/8QAKREAAQQBAgMIAwAAAAAAAAAAAQACAxEEBSExQVEGEhMUFSJxgWGhsf/aAAwDAQACEQMRAD8A6G1rquJpe3h14d7KdyGGAcFZ6nokczUI1Fqi7X91RuEtZZJyGGzstp/15+5yaNZ3ty/6hlzVKJZKthhJ8rY+n54+5rY+zrR0XU9juy5JW0+hxLcd5PkITk5HAg5Gad8TEg0qATzj3bWel9PjmqznF5oLQab2HUd1sLwXbZjjaM5U0o7TavdJ3fvjWLUFknWG5KhXFkod8ik70ujkUnn/ADTp/Rr9t0s/eb4tcVSgERY2PGtajuKugxk447uVa0s+O9jQ8gh3DnagAeSsGhNYRtUw1DZDE9kDvmM53epPVP8AFFQXTV3esd7iXBgnLSxtp9aD9ST7j+qKVdQ0KVst4zbaf1+EdkordLDVz7IVx7ZomM5LfaYM2U4W+8WE7as7IAzxPhqR6sszlhv8yA4DsNry0o+Zs70n43e4NJ5Lr77TLTrri2mQUtIUokIBOSEjlv31v6hj+oQNDHbGj9UgtPcK6xfix5DjLj7LTi2VbbalpBKFcMjoaiXbXfP82/M2plWWYKdpzHN1Q/pOPk1k0P2nvW2CuFfw5JS02THfG9ZIG5C+vQK+etTqRIemzH5UlRW++tTjiuqicmsfSdMlhyS6UbN4fam94I2XkUUwsFrevN4iQIwJcfcCSfSnzK/QyaKYcjPx8UhsrqJQw0u4K+680hH1TBThQYnsg9y9jI/FXVJ/5UFvthuVjklm5xHGTnwrxlC/xVwNFFLXZ/Nl8TyxNt/nwjStFWlWyKY2azXC8SQxbIjshZ4lI8KfupXAfuiimfLlMELpWjcBBaLNK7dn2i2dMRlPSFJeubycOOD6UJ9Kft1POiiiucTzyZEhkkNkq2AAKC//2Q==',
    photoId: 'avatar/d595695a5fd45f0d8ac1c3b3558c8e7a.jpg',
    bio:
      'Official account of Meetup Now. A place where people come together to grow together.',
    location: 'New York, NY',
  });

exports.down = knex =>
  knex('users')
    .where({ id: NOW_BOT_USER_ID })
    .del();
