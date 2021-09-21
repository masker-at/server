import { FC, useEffect, useState } from 'react';
import useAliasList from '../../api-hooks/useAliasList';
import useCreateAlias from '../../api-hooks/useCreateAlias';
import useMeQuery from '../../api-hooks/useMeQuery';
import Alias from './Alias';

const AliasList: FC = () => {
  const { data } = useAliasList();
  const { mutate } = useCreateAlias();
  const [search, setSearch] = useState('');
  const { data: meData } = useMeQuery();

  useEffect(() => {
    (window as any).Paddle.Checkout.open({
      product: 16124,
      email: meData!.email,
      passthrough: JSON.stringify({ userID: meData!.id }),
      disableLogout: true,
      marketingConsent: 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex-grow sm:pl-5 xl:mr-72 flex flex-col">
      <section className="flex-grow-0 flex-shrink-0 flex justify-between items-center flex-wrap">
        <button
          type="submit"
          className="button bg-primary active:bg-primary-darker"
          onClick={() => mutate({})}
        >
          + New
        </button>

        <input
          type="text"
          placeholder="Search..."
          aria-label="Search"
          className="px-2 py-1 rounded outline-none border border-gray-400 focus:border-primary"
          value={search}
          onChange={({ target }) => setSearch(target.value)}
        />
      </section>

      <section className="flex-1 overflow-auto mt-3">
        {data?.map(
          (alias) =>
            (!search || alias.name?.toLowerCase().includes(search.toLowerCase())) && (
              <Alias alias={alias} key={alias.id} />
            ),
        )}
      </section>
    </main>
  );
};
export default AliasList;
