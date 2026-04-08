import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // ── Old types (from previous version) ─────────────────────────────────────

  type UserRole = { #admin; #guest; #user };

  type OldActor = {
    accessControlState : { var adminAssigned : Bool; userRoles : Map.Map<Principal, UserRole> };
    var whatsappNumber : ?Text;
  };

  // ── New types (for current version) ───────────────────────────────────────

  type NewActor = {
    var whatsappNumber : Text;
  };

  // ── Migration function ─────────────────────────────────────────────────────
  // Consumes accessControlState (discards it) and converts whatsappNumber ?Text → Text

  public func run(old : OldActor) : NewActor {
    let number = switch (old.whatsappNumber) {
      case null { "" };
      case (?n) { n };
    };
    { var whatsappNumber = number };
  };
};
