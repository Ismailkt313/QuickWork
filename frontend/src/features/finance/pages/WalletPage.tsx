import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet, fetchTransactions } from "../store/walletSlice";
import type { AppDispatch, RootState } from "../../../app/store";
import {
  RiWallet3Line,
  RiArrowUpCircleLine,
  RiArrowDownCircleLine,
  RiAlertLine,
  RiHistoryLine,
  RiSearchLine,
} from "react-icons/ri";
import useDebounce from "../../../hooks/useDebounce";

const WalletPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { wallet, transactions, pagination, loading } = useSelector(
    (state: RootState) => state.wallet
  );

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchTransactions({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
      })
    );
  }, [dispatch, page, debouncedSearch]);

  const isNegative = (wallet?.balance || 0) < 0;
  const totalPages = pagination?.pages || 1;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="bg-primary bg-opacity-10 p-3 rounded-4 text-primary">
              <RiWallet3Line size={32} />
            </div>
            <div>
              <h2 className="fw-bold mb-0">My Wallet</h2>
              <p className="text-muted mb-0">
                Manage your earnings and platform dues
              </p>
            </div>
          </div>

          {}
          <div
            className={`card border-0 shadow-sm rounded-4 overflow-hidden mb-4 ${isNegative ? "bg-danger-subtle" : "bg-primary"}`}
          >
            <div className="p-5 text-white">
              <h6 className="opacity-75 mb-2">
                {isNegative ? "Outstanding Dues" : "Available Balance"}
              </h6>
              <h1 className="display-4 fw-bold mb-0">
                ₹{Math.abs(wallet?.balance || 0).toLocaleString()}
              </h1>
              {isNegative && (
                <div className="mt-3 d-flex align-items-center gap-2 text-danger fw-bold">
                  <RiAlertLine />
                  You owe platform dues
                </div>
              )}
            </div>
            <div className="bg-white bg-opacity-10 p-3 d-flex justify-content-between align-items-center">
              <span className="text-white small">
                Provider ID: {wallet?.providerId || "..."}
              </span>
              <button
                className="btn btn-light rounded-pill px-4 fw-bold"
                disabled={(wallet?.balance || 0) <= 0}
              >
                Withdraw
              </button>
            </div>
          </div>

          {}
          {isNegative && (
            <div className="alert alert-warning border-0 rounded-4 p-4 mb-4 d-flex gap-3">
              <RiAlertLine
                size={24}
                className="text-warning flex-shrink-0"
              />
              <div>
                <h6 className="fw-bold mb-1">Important Notice</h6>
                <p className="mb-0 small">
                  You have pending platform dues. Future earnings will be
                  adjusted to clear this balance. Please ensure your dues
                  remain below ₹1,000 to keep your account active.
                </p>
              </div>
            </div>
          )}

          {}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <RiHistoryLine className="text-muted" />
                <h6 className="fw-bold mb-0">Transaction History</h6>
              </div>
              <div className="position-relative">
                <RiSearchLine className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control form-control-sm ps-5 rounded-pill border-light-subtle bg-light"
                  placeholder="Search by ID, source..."
                  style={{ width: "260px" }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            <div className="list-group list-group-flush">
              {loading ? (
                <div className="p-5 text-center text-muted">
                  Loading transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  {searchTerm
                    ? "No transactions match your search"
                    : "No transactions yet"}
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="list-group-item p-4 border-0 border-bottom"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className={`p-2 rounded-circle ${tx.type === "credit" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                        >
                          {tx.type === "credit" ? (
                            <RiArrowDownCircleLine size={24} />
                          ) : (
                            <RiArrowUpCircleLine size={24} />
                          )}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-capitalize">
                            {tx.source.replace("_", " ")}
                          </h6>
                          <span className="text-muted small">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-muted small ms-2" style={{ fontFamily: "monospace", fontSize: "10px", opacity: 0.6 }}>
                            ID: {tx.transactionCode}
                          </span>
                        </div>
                      </div>
                      <div className="text-end">
                        <h6
                          className={`fw-bold mb-0 ${tx.type === "credit" ? "text-success" : "text-danger"}`}
                        >
                          {tx.type === "credit" ? "+" : "-"} ₹{tx.amount}
                        </h6>
                        <span className="text-muted small">
                          Balance: ₹{tx.balanceAfter}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {}
            {totalPages > 1 && (
              <div className="p-4 border-top d-flex justify-content-center align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹ Prev
                </button>
                <span className="text-muted small fw-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
