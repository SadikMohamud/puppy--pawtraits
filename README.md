# Puppy Pawtraits, After Dark

The second design option for Jason Robinson's dog portrait site: a dark, cinematic gallery where the
photographs lead and the page moves with them. The shop is the same as the first option (bag, sizes and
Stripe Checkout), so the two can be compared like for like. See `DESIGN.md` for the references and plan.

- **Intro**: a tilted wall of portraits drifts with the pointer; the first scroll or tap flips one portrait to full screen.
- **Hero**: moving the pointer leaves a trail of portraits.
- **Statement**: an image grows out of the line "Every dog sits a little differently" as you scroll.
- **Work**: all the portraits in columns that trail the scroll elastically, with filters and a lightbox.
- **The sitters**: a tilted slideshow with each dog's name set huge behind them.
- **Prints**: each print opens through a widening cross into a full preview with sizes and Add to bag.
- **Commission**: three full-screen photographs that wipe into each other as you scroll, then contact.

Built with Next.js 15 (App Router), TypeScript, GSAP (ScrollTrigger, Flip) and Lenis. Every effect settles to its
end state for visitors who prefer reduced motion.

## Run it

```sh
npm install
cp .env.example .env.local   # add your Stripe secret key
npm run dev
```

## Before launch

1. **Photos.** The photographs in `public/work` are stand-ins from Unsplash, used under the Unsplash Licence to
   show the design with real photography. The photographer of each one is listed as `credit` in
   `lib/catalogue.ts`. Replace them with Jason's own work, keeping the file names or updating `image`, `width`
   and `height` for each entry.
2. **Prints and prices.** Edit `prints`, `sizes` and `shipping` in `lib/catalogue.ts`. Prices are in pence and are
   read on the server at checkout.
3. **Studio details.** Email and Instagram live in `lib/site.ts`.
4. **Stripe.** Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_SITE_URL` in the hosting environment. Test with
   `sk_test_...` keys and card `4242 4242 4242 4242` first.
